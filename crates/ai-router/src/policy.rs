//! Which offers to try, in which order. Policies:
//! - `auto` (default): local servers first, then offers at zero cost for this caller, then the cheapest;
//! - `auto:local`, `auto:free`, `auto:cheap`: only that tier (cheap = every paid offer, cheapest first);
//! - `<provider>/<model>` or `<model>`: that offer, then the `auto` order as fallback.
//! Offers without a credential are never candidates. Requests with tools or images keep only offers that accept them.

use crate::catalog::Offer;

#[derive(Clone, Copy, Debug, Default)]
pub struct Needs {
    pub tools: bool,
    pub images: bool,
    /// Rough prompt size in tokens; offers with a known smaller context are skipped.
    pub tokens: u64,
}

fn tier(o: &Offer) -> u8 {
    if o.local {
        0
    } else if o.zero_cost() {
        1
    } else {
        2
    }
}

fn fits(o: &Offer, n: &Needs) -> bool {
    (!n.tools || o.tool_call) && (!n.images || o.image_input || o.local) && (o.context == 0 || o.context >= n.tokens)
}

/// Candidates in the order they are tried.
pub fn rank<'a>(offers: &'a [Offer], model: &str, needs: &Needs) -> Vec<&'a Offer> {
    let mut usable: Vec<&Offer> = offers.iter().filter(|o| o.available() && fits(o, needs)).collect();
    usable.sort_by(|a, b| {
        tier(a)
            .cmp(&tier(b))
            .then((a.cost_in + a.cost_out).total_cmp(&(b.cost_in + b.cost_out)))
            .then(b.context.cmp(&a.context))
            .then(b.release_date.cmp(&a.release_date))
    });
    match model {
        "" | "auto" => usable,
        "auto:local" => usable.into_iter().filter(|o| tier(o) == 0).collect(),
        "auto:free" => usable.into_iter().filter(|o| tier(o) <= 1).collect(),
        "auto:cheap" => usable.into_iter().filter(|o| tier(o) == 2).collect(),
        wanted => {
            let (first, rest): (Vec<&Offer>, Vec<&Offer>) = usable.into_iter().partition(|o| o.id() == wanted || o.model == wanted);
            first.into_iter().chain(rest).collect()
        }
    }
}
