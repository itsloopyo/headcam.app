<!-- managed by Lab - edit via Agents in the sidebar; changes here are overwritten on the next sync -->

<!-- agent: Action Versions -->
Keep GitHub Actions off deprecated Node runtimes

GitHub periodically deprecates the Node.js version that JavaScript actions run on (Node 20 → Node 24, etc.), and any action pinned to a version bundling the old runtime emits a build warning until it's bumped. When adding or reviewing a workflow, pin every third-party action to a release whose action runtime targets the current Node version GitHub supports — not just the latest tag, but one whose bundled runs.using is current. Pin to the commit SHA (tags are mutable) with a trailing # vX.Y.Z comment, and only use releases at least two weeks old. If a "Node.js NN actions are deprecated" warning appears, fix it by upgrading the offending action to a Node-current release rather than setting FORCE_JAVASCRIPT_ACTIONS_TO_NODE24 or ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION, which only mask the problem. The matched artifact-action pair must stay compatible (e.g. upload-artifact v7 ↔ download-artifact v8), so bump them together.


<!-- agent: Agents and skills -->
If you need to fix issues in or expand on AGENTS.md or any skills, please note that the ones in this repo are machine generated, the authoritative sources where they must be edited are /c/data/agents and /c/data/skills


<!-- agent: AI generated prose -->
Don't use AI generated prose - no em-dashes, no "it's not x, it's y" etc, interact with the world through text like a human being.


<!-- agent: Be awesome -->
Strive for perfection in all your work


<!-- agent: Code quality minimums -->
## Code quality minimums

These apply to every line of code in every repo. They override convenience.

### Fail fast, don't fail silent

If something fails, let it throw. No swallowed exceptions. No silent
fallbacks that mask the underlying problem. No retry loops that paper
over a broken contract. The error message is the diagnostic; if you
catch and rewrite it, you've thrown the diagnostic away.

The narrow exception: validate at system boundaries (user input,
external APIs, file system). Everything inside the boundary trusts the
contract.

### No fallbacks for impossible cases

Don't add error handling, validation, or fallbacks for scenarios that
can't happen. Trust internal code and framework guarantees. A `Result`
that's always `Ok` doesn't need to be a `Result`. A null check on a
value that's constructed three lines earlier is noise.

### No over-engineering

Don't add features, refactor, or introduce abstractions beyond what the
task requires. A bug fix doesn't need surrounding cleanup. A one-shot
operation doesn't need a helper function. Don't design for hypothetical
future requirements. Three similar lines is better than a premature
abstraction.

No half-finished implementations either. If you can't complete it, say
so and stop, don't leave a stub that compiles but lies.

### No decorative comments

Default to writing zero comments. Only add a comment when the WHY is
non-obvious: a hidden constraint, a subtle invariant, a workaround for
a specific bug, behavior that would surprise a reader. If removing the
comment wouldn't confuse a future reader, don't write it.

Don't explain WHAT the code does (well-named identifiers do that).
Don't reference the current task, fix, or callers ("used by X", "added
for the Y flow", "fixes #123"). Those belong in the PR description and
rot as the codebase evolves.

### No backwards-compat hacks for unused code

If something is unused, delete it completely. Don't rename to `_unused`,
don't add `// removed` comments, don't re-export removed types as
aliases. Backwards compatibility is for shipped public APIs (see the
Libraries category rule); internal scaffolding gets cut clean.


<!-- agent: Dependencies -->
Don't use brand new versions of dependencies unless specifically instructed - always use >2weeks old to avoid supply chain issues

Use pnpm and ALWAYS do the equivalent of --ignore-scripts when installing packages, in ANY language. 

For ANY app that can run containerised (pretty much anything that doesn't need GPU access) ensure you run it and all development work around it in containers - DO NOT RUN ANYTHING ON THE HOST UNLESS ABSOLUTELY 100% NECESSARY, and even then, ensure you treat any actions as a potential attack vector and act defensively.


<!-- agent: gitignore -->
.lab, .claude, our skills, agents.md/claude.md and any MCP servers should be added to the project's .gitignore so they are not tracked in git.


<!-- agent: Lab Notes -->
If there is important project-specific information, it will be found in a .lab/NOTES.md - read this file at the start of each session should it exist.


<!-- agent: Pixi rules -->
In pixi files:

The `project` field is deprecated. Use `workspace` instead.

## CI builds through the same `pixi run` a developer runs

A build that passes locally must build identically in CI. The only robust
way to guarantee that is to make CI invoke the *same* command a developer
runs - `pixi run package` - and put zero build logic in the workflow YAML.
Workflows own orchestration only: checkout, `setup-dotnet` + `setup-pixi`,
`pixi run package`, then artifact staging / release publishing.

This forbids the two ways local and CI drift:

- **No inline build steps in workflows.** If `build.yml`/`release.yml`
  contains its own `dotnet build`, stub generation, dependency download,
  or a `-p:` override that the local `pixi run` path doesn't also apply,
  it is a second, drifting copy of the build. Move it into the pixi task
  chain (a `setup`/`bootstrap` script that `restore`/`build` depend on).
- **Build dependencies must be game-independent.** `pixi run package`
  must succeed from a clean checkout with **no game installed** - on a CI
  runner, and on a contributor's machine who doesn't own the game.
  Resolve build references from repo files only: vendored loader archives,
  NuGet packages, and reference *stubs* compiled from a checked-in stub
  source (e.g. `UnityStubs.cs`) - never copied from a game install. A
  `setup` task that copies `GH_Data\Managed\*.dll` out of the game is the
  classic trap: a contributor with the game builds against the real DLLs,
  CI builds against the stubs, and a member the stub is missing passes
  locally and fails on push. `Directory.Build.props` must default to the
  generated stubs; a game path is an explicit `-p:UnityEnginePath=` opt-in
  for validation, never the default.

Prove it the only way that counts: run `pixi run package` on a machine
without the game and confirm it produces the installer ZIP.


<!-- agent: Static site conventions -->
## Static site conventions

For any site in this category. Currently small in scope; future-proofed
in case we add more.

### Static-only by default, no build step

If the site can ship as plain HTML/CSS/JS, it does. No Vite, no Next,
no Tailwind preprocess, no npm dependency tree. The reason is
operational: a marketing site that breaks because a transitive npm dep
got yanked is an embarrassing outage. A folder of static files cannot
break that way.

If a build step is genuinely required (e.g. blog with hundreds of
posts), the build output is what gets committed and served, not the
source. GitHub Pages serves what's in the branch.

### CNAME and .nojekyll are deployment infrastructure

`CNAME` pins the custom domain - don't delete it. `.nojekyll` disables
GitHub Pages' Jekyll preprocessing - don't delete it (it makes
underscore-prefixed paths work). If you do add a build step, replace
`.nojekyll` with the build output rather than re-enabling Jekyll.

### Mobile-first layout

Test in a phone viewport before merging. Hero animations especially:
big-screen-only effects that look great on a 27" monitor often stutter
or break the layout on a mid-tier phone. Image budget per asset: aim
for under 300KB, hard cap at 1MB. Use `loading="lazy"` for anything
below the fold.

### Marketing copy is SEO

The `<title>`, `<meta name="description">`, OpenGraph, and Twitter card
tags drive search snippets and link previews. Don't churn them
incidentally. Any change is effectively a marketing change and should
match the current product description (App Store metadata, TestFlight
description, README hero).

### External links rot

Beta invite URLs (TestFlight, Play Console internal testing) can be
revoked or rolled. Download links to GitHub Releases break when the
release is yanked. After any change to where these point, click the
live link in production. The site has no automated link-check; the
human eye is the only check.

### Hosted artifacts go in the repo, not in CI

If the site links to a binary download (alt-store IPA, sideload APK,
DMG), the binary lives in `downloads/` in the repo. Don't auto-populate
from CI - the moment CI starts pushing artifacts to a Pages-hosted
folder, you've turned a static site into a deploy target with secrets
and surface area.
