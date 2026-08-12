---
title: Theming
summary: The token layer, what a theme may change, and what it deliberately cannot.
group: Extending it
order: 70
---

# Theming

## The layer

A theme is a set of CSS custom properties, rendered into a scoped `<style>` on the server. Not written to `documentElement` in an effect — doing that flashes the default palette on every load, which the first version of this project did.

Six ship: Editorial, Terminal, Gallery, Warm, Bold and Minimal. Each sets palette, typeface, spacing scale and corner radius together, in light and dark.

## What a theme owns

Colour, type, spacing, radius, hairline weight, motion durations. Everything a block reads through `var(--…)`.

## What a theme cannot do

**Rearrange a page.** A theme changes how things look, never where they are. Arrangement comes from which blocks the owner placed and in what order — which is why the blocks that place records matter more than a seventh theme would.

This is the honest limitation to state when somebody asks whether the designs are different enough. They are six looks, not six layouts.

## The override rule

The owner's own values sit on top of the theme, and the rule is one sentence: **a non-empty override wins; an empty one defers to the theme.**

So switching theme never discards a colour somebody chose deliberately, and clearing a field returns it to the theme rather than to white.

## Contrast is a gate, not a warning

Publishing runs a contrast audit over the resolved palette and **refuses** a combination nobody could read. Enforced at the endpoint rather than only in the dashboard, because a client that skips the warning — or a direct call — must not be able to put unreadable text in front of visitors.

Scoped to contrast on purpose. The health report marks other things "blocking" that are judgement calls; refusing every one of them would make publishing feel broken rather than careful.

## Adding a theme

A token file, and that is the whole of it. If a theme needs a block to change its markup, the contract has been broken and the fix is in the block or the primitive, not in the theme.

The first theme, `editorial`, carries the exact values the site had before themes existed, so upgrading restyles nobody's site.
