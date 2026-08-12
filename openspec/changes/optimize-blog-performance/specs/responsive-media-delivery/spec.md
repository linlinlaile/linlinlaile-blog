## Purpose

Deliver blog images at an appropriate size and loading priority so media remains visually correct without forcing mobile visitors to download unnecessarily large files.

## ADDED Requirements

### Requirement: Media has stable responsive geometry
Displayed article covers, gallery images, avatars, and background media SHALL declare responsive dimensions or aspect-ratio constraints before the image loads.

#### Scenario: Slow image load
- **WHEN** an image request is delayed
- **THEN** its reserved space remains stable and surrounding content does not shift unexpectedly

### Requirement: Below-the-fold media is deferred
Images outside the initial viewport SHALL use deferred loading behavior, while only the primary above-the-fold visual may use eager/high-priority loading when justified by measurement.

#### Scenario: Gallery below the fold
- **WHEN** a visitor opens a page containing images below the initial viewport
- **THEN** those images are not requested at initial load and load as they approach visibility
