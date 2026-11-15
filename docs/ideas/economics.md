# Économie des fournisseurs

Prix relevés sur les pages officielles pendant la session. Ils changent : à revérifier avant toute décision.

## Hébergement et calcul

| Fournisseur | Élément | Prix |
|---|---|---|
| Cloudflare Workers Paid | forfait | 5 $/mois, 10 M requêtes incluses, puis 0,30 $/M |
| Cloudflare | assets statiques | gratuits |
| Cloudflare R2 Standard | stockage | 0,015 $/Go-mois ; classe A 4,50 $/M ; classe B 0,36 $/M ; sortie gratuite |
| Cloudflare R2 Infrequent Access | stockage | 0,01 $/Go ; classe A 9 $/M ; classe B 0,90 $/M |
| Cloudflare Workers AI | inférence | 0,011 $ / 1000 neurones ; gpt-oss-120b 0,35 $ entrée / 0,75 $ sortie par M tokens |
| Cloudflare AI Gateway | passerelle | gratuite ; 5 % sur les crédits en facturation unifiée |
| Vercel | Hobby / Pro | 0 $ / 20 $ par siège |
| Vercel AI Gateway | passerelle | sans marge |

## Modèles

| Canal | Frais | Exemples |
|---|---|---|
| OpenRouter | 5,5 % à l'achat de crédits ; BYOK gratuit jusqu'à 25 k$/mois puis 5 % | gpt-5.6-sol 4,40 / 22 $ ; gpt-oss-120b 0,15 / 0,60 $ |
| opencode Zen | 4,6 % + 0,31 $ par achat ; Go 10 $, Go Plus 40 $, Teams 20 $/membre | |
| OpenAI direct | Batch et Flex -50 % | gpt-5.6-sol 4 / 20 $ ; terra 2 / 12 $ ; luna 0,20 / 1,20 $ |
| Vercel AI Gateway | prix fournisseur | gpt-5.6-sol 4 / 20 $ ; gpt-oss-120b 0,10 / 0,50 $ |

(prix en $ par million de tokens, entrée / sortie)

## Leviers notés

- Les opérations de classe A dominent un bucket de sauvegarde quotidienne avec `--checksum` : `--size-only` les réduit.
- Un routeur qui préfère les offres gratuites puis les moins chères capte la plus grande économie ; les marges de passerelle (OpenRouter 5,5 %, Zen 4,6 %) disparaissent en direct ou par Vercel AI Gateway.
