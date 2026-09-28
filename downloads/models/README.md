# Models

Pose models the Headcam app can download, so a new model can ship without a Play Store review.
The app does not fetch anything from here yet; this is the layout it will read.

`catalog.json` lists every model ever published. Each entry names its file, the file's SHA-256
and size, and what the app needs to run it.

## Rules

- A published file is never replaced or renamed. A new model, or a new build of the same one, is
  a new file with a higher `version_code`. That keeps every hash in the catalog valid, and a
  downgrade is loading an older entry.
- `name` is what the app shows people. Keep it short and plain.
- `version_code` is a whole number that only goes up within an `id`. It decides upgrade order.
- `channel` is `candidate` for release candidates and `release` for models every user gets.
- To pull a bad model, set `withdrawn: true`. Leave the entry and the file in place so installs
  that already have it can still verify it.
- `contract` is the input and outputs the app feeds and reads. An app must refuse a model whose
  contract it does not match.
- `runtime.depth_source` says where depth comes from: `pose` means the pose net's own size
  output, with no separate depth model.
- `requires.app_version_code_min` is the oldest app build that can run the model; `null` until
  the app can download models at all.

## Adding a model

1. Export it from headshot with the batch-1 Android export and check it passes the contract.
2. Copy it to `<kind>/<id>-<version_code>.onnx`.
3. Add its entry to `catalog.json` with the file's `sha256` and `size_bytes`, taken from the
   copied file.
