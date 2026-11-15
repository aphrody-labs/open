// Render tree of a doc page. The MDX components of the Bun docs map onto Material 3 components by kind:
// admonitions -> cards, tabs and code groups -> tabs, steps -> vertical stepper, accordions -> expansion panels,
// cards -> cards, parameter fields -> lists, frames -> figures. Unknown elements render their children.
import { Component, Input, ViewEncapsulation } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatChipsModule } from "@angular/material/chips";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import type { Block } from "./store.ts";
import { CodeBlock } from "./code.ts";

const admonition: Record<string, { icon: string; tone: string }> = {
  Note: { icon: "info", tone: "secondary" },
  Info: { icon: "info", tone: "secondary" },
  Tip: { icon: "lightbulb", tone: "tertiary" },
  Check: { icon: "check_circle", tone: "tertiary" },
  Callout: { icon: "campaign", tone: "secondary" },
  Warning: { icon: "warning", tone: "error" },
};

@Component({
  selector: "app-blocks",
  // the Markdown runs are inserted as HTML, which emulated encapsulation would not reach
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet, CodeBlock, MatCardModule, MatChipsModule, MatExpansionModule, MatIconModule, MatListModule, MatStepperModule, MatTabsModule, MatTooltipModule],
  template: `
    @for (b of blocks; track $index) {
      @switch (b.t) {
        @case ("md") { <div class="md" [innerHTML]="$any(b).html"></div> }
        @case ("code") { <app-code [block]="$any(b)" /> }
        @case ("jsx") {
          @let j = $any(b);
          @if (adm(j.name); as a) {
            <mat-card appearance="outlined" class="adm" [attr.data-tone]="a.tone">
              <mat-card-content class="adm-body"><mat-icon class="adm-icon">{{ a.icon }}</mat-icon><div><app-blocks [blocks]="j.children" /></div></mat-card-content>
            </mat-card>
          } @else {
            @switch (j.name) {
              @case ("Tabs") {
                <mat-tab-group animationDuration="150ms" mat-stretch-tabs="false">
                  @for (t of j.children; track $index) {
                    <mat-tab [label]="t.attrs?.title ?? 'Tab ' + ($index + 1)"><div class="tab"><app-blocks [blocks]="t.children ?? [t]" /></div></mat-tab>
                  }
                </mat-tab-group>
              }
              @case ("CodeGroup") {
                <mat-tab-group animationDuration="150ms" mat-stretch-tabs="false">
                  @for (c of j.children; track $index) {
                    <mat-tab [label]="c.file ?? c.lang ?? 'Example ' + ($index + 1)"><app-blocks [blocks]="[c]" /></mat-tab>
                  }
                </mat-tab-group>
              }
              @case ("Steps") {
                <mat-stepper orientation="vertical" [linear]="false">
                  @for (s of j.children; track $index) {
                    <mat-step [label]="s.attrs?.title ?? 'Step ' + ($index + 1)" [completed]="false"><app-blocks [blocks]="s.children ?? [s]" /></mat-step>
                  }
                </mat-stepper>
              }
              @case ("AccordionGroup") { <mat-accordion multi><app-blocks [blocks]="j.children" /></mat-accordion> }
              @case ("Accordion") { <ng-container *ngTemplateOutlet="panel; context: { $implicit: j }" /> }
              @case ("Expandable") { <ng-container *ngTemplateOutlet="panel; context: { $implicit: j }" /> }
              @case ("CardGroup") { <div class="grid" [style.--cols]="j.attrs.cols ?? 2"><app-blocks [blocks]="j.children" /></div> }
              @case ("Columns") { <div class="grid" [style.--cols]="j.attrs.cols ?? 2"><app-blocks [blocks]="j.children" /></div> }
              @case ("Card") {
                <mat-card appearance="raised" class="card">
                  <mat-card-header>
                    @if (j.attrs.icon) { <mat-icon mat-card-avatar>article</mat-icon> }
                    <mat-card-title>@if (j.attrs.href) { <a [href]="j.attrs.href">{{ j.attrs.title }}</a> } @else { {{ j.attrs.title }} }</mat-card-title>
                  </mat-card-header>
                  <mat-card-content><app-blocks [blocks]="j.children" /></mat-card-content>
                </mat-card>
              }
              @case ("ParamField") { <ng-container *ngTemplateOutlet="field; context: { $implicit: j }" /> }
              @case ("ResponseField") { <ng-container *ngTemplateOutlet="field; context: { $implicit: j }" /> }
              @case ("Frame") {
                <figure class="frame"><app-blocks [blocks]="j.children" />@if (j.attrs.caption) { <figcaption>{{ j.attrs.caption }}</figcaption> }</figure>
              }
              @case ("Badge") { <mat-chip-set><mat-chip>{{ j.attrs.children ?? j.name }}</mat-chip></mat-chip-set> }
              @case ("Tooltip") { <span [matTooltip]="j.attrs.tip ?? ''"><app-blocks [blocks]="j.children" /></span> }
              @case ("img") { <img [src]="j.attrs.src" [alt]="j.attrs.alt ?? ''" loading="lazy" /> }
              @case ("Image") { <img [src]="j.attrs.src" [alt]="j.attrs.alt ?? ''" loading="lazy" /> }
              @default { <app-blocks [blocks]="j.children" /> }
            }
          }
        }
      }
    }
    <ng-template #panel let-j>
      <mat-expansion-panel>
        <mat-expansion-panel-header><mat-panel-title>{{ j.attrs.title }}</mat-panel-title></mat-expansion-panel-header>
        <app-blocks [blocks]="j.children" />
      </mat-expansion-panel>
    </ng-template>
    <ng-template #field let-j>
      <mat-list class="field">
        <mat-list-item lines="2">
          <span matListItemTitle class="mono">{{ j.attrs.path ?? j.attrs.query ?? j.attrs.body ?? j.attrs.header ?? j.attrs.name }}</span>
          <span matListItemLine>{{ j.attrs.type }}@if (j.attrs.required) { , required }@if (j.attrs.default) { , default {{ j.attrs.default }} }</span>
        </mat-list-item>
      </mat-list>
      <div class="field-body"><app-blocks [blocks]="j.children" /></div>
    </ng-template>
  `,
  styles: `
    app-blocks { display: block; }
    app-blocks .md :is(h2, h3) { font: var(--mat-sys-title-large); margin: 28px 0 8px; }
    app-blocks .md h3 { font: var(--mat-sys-title-medium); }
    app-blocks .md p, app-blocks .md li { font: var(--mat-sys-body-large); line-height: 1.6; }
    app-blocks .md code { background: var(--mat-sys-surface-container-high); padding: 0 4px; border-radius: var(--mat-sys-corner-extra-small); }
    app-blocks .md table { border-collapse: collapse; width: 100%; }
    app-blocks .md th, app-blocks .md td { border-bottom: 1px solid var(--mat-sys-outline-variant); padding: 8px; text-align: start; }
    app-blocks img { max-width: 100%; height: auto; }
    app-blocks .md pre { overflow: auto; }
    app-blocks .adm { margin: 16px 0; }
    app-blocks .adm[data-tone="secondary"] { background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container); }
    app-blocks .adm[data-tone="tertiary"] { background: var(--mat-sys-tertiary-container); color: var(--mat-sys-on-tertiary-container); }
    app-blocks .adm[data-tone="error"] { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
    app-blocks .adm-body { display: flex; gap: 12px; align-items: flex-start; }
    app-blocks .adm-icon { flex: none; margin-top: 2px; }
    app-blocks .tab { padding-top: 8px; }
    app-blocks .grid { display: grid; gap: 16px; grid-template-columns: repeat(var(--cols), minmax(0, 1fr)); margin: 16px 0; }
    @media (max-width: 599px) { app-blocks .grid { grid-template-columns: 1fr; } }
    app-blocks .frame { margin: 16px 0; }
    app-blocks figcaption { font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
    app-blocks .field { padding: 0; }
    app-blocks .field-body { padding-inline-start: 16px; border-inline-start: 2px solid var(--mat-sys-outline-variant); margin-bottom: 8px; }
    app-blocks .mono { font-family: "Roboto Mono Variable", monospace; }
  `,
})
export class Blocks {
  @Input() blocks: Block[] = [];
  adm(name: string) {
    return admonition[name] ?? null;
  }
}
