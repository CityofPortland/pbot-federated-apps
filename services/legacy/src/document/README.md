# Static text documents
This folder contains documents that are intended for display as static HTML in any web applications consuming this GraphQL
## Transportation System Plan
The `transportation-system-plan` folder contains PBOT's plan to implement Portland's plan for 2035.
### Data structure
| key | description | example |
| --- | --- | --- |
| id | Unique (within whatever subtree is on the page) text dentifier for this section, must be a string that is URL compatible for an anchor identifier | 'section-1-1' |
| name | Dipslay name for the section | 'Section 1.1' |
| tree | Array of numbers that defines the place of this section within the hierarchy of the document | [6, 1, 1]
