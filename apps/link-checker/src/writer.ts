/*
CompositeWriter

This module serves as a unified interface to produce different
structured JSON representations of link-checking statistics
aggregated at various levels: Page, Link, Address, and Diff.

It orchestrates the functionality of the individual writers:
- PageWriter
- LinkWriter
- AddressWriter
- DiffWriter
- ReportWriter

By leveraging these specialized writers, CompositeWriter
enables comprehensive reporting and analysis of link-checking
results in a consistent format.
*/

/*

*/

/*
PageWriter

This module consumes link-checking statistics from a single run
to produce a structured JSON representation of page-aggregated statistics 

```json
{
  "id": "snapshot-2025-12-31T150000Z-7f8e9d",
  "type": "page",
  "createdAt": "2025-12-31T15:00:00Z",
  "baseUrl": "https://example.com",
  "links": [
    {
      "href": "https://example.com/about",
      "xpath": "/html[1]/body[1]/nav[1]/a[3]"
    },
    {
      "href": "https://external-site.com/resource",
      "xpath": "/html[1]/body[1]/main[1]/article[1]/a[2]"
    }
  ],
  "stats": {
    "totalLinks": 150,
    "uniqueLinks": 120,
    "brokenLinks": 5,
    "skippedLinks": 10,
    "redirectedLinks": 8
  }
}

*/

/*
LinkWriter

This module consumes link-checking statistics from a single run
to produce a structured JSON representation of link statistics aggregated 
at the Link level

```json
{
  "id": "snapshot-2025-12-31T150000Z-7f8e9d",
  "type": "link",
  "createdAt": "2025-12-31T15:00:00Z",
  "parent_url": "https://example.com/",
  "href_url": "https://example.com/about",
  "final_url": "https://example.com/contact/about",
  "xpath": "/html[1]/body[1]/nav[1]/a[3]",
  "status": 200,
  "isBroken": false,
  "isSkipped": false,
  "isRedirected": false,
  "redirects": [],
  "contentHash": "abc123def456ghi789"
}
*/

/*
AddressWriter

This module consumes link-checking statistics from a single run
to produce a structured JSON representation of link statistics aggregated 
at the Address level

```json
{
  "id": "snapshot-2025-12-31T150000Z-7f8e9d",
  "type": "address",
  "createdAt": "2025-12-31T15:00:00Z",
  "url": "https://example.com/about",
  "status": 200,
  "isBroken": false,
  "isSkipped": false,
  "isRedirected": true,
  "redirect_path": [
    {
      "url": "https://example.com/about",
      "status": 301
    },
    {
      "url": "https://example.com/about-us",
      "status": 302
    },
    {
      "url": "https://example.com/contact/about",
      "status": 200
    }
  ]
}
*/


/*
DiffWriter

This module consumes two sets of link-checking statistics to highlight the 
differences between them. 

example output
```json
{
  "id": "comparison-2025-12-31T150000Z-7f8e9d",
  "type": "diff",
  "createdAt": "2025-12-31T15:00:00Z",
  "production": {
    "snapshotId": "snapshot-2025-12-30T120000Z-a1b2c3",
    "baseUrl": "https://example.com"
  },
  "development": {
    "snapshotId": "snapshot-2025-12-31T143000Z-3900bc",
    "baseUrl": "https://staging.example.com"
  },
  "stats": {
    "regressions": [
      {
        "source": "https://example.com/",
        "xpath": "/html[1]/body[1]/nav[1]/a[3]",
        "hrefProduction": ["301 https://example.com/old-page", "200 https://example.com/resolved-page"],
        "hrefDevelopment": ["301 https://example.com/old-page", "404 https://example.com/not-found"]
      }
    ],
    "fixes": [
      {
        "source": "https://example.com/subpage",
        "xpath": "/html[1]/body[1]/nav[1]/a[3]",
        "hrefProduction": ["301 https://example.com/old-page", "404 https://example.com/not-found"],
        "hrefDevelopment": ["301 https://example.com/old-page", "200 https://example.com/target-page"]
      }
    ],
    "newDestination": [
      {
        "source": "https://example.com/subpage",
        "xpath": "/html[1]/body[1]/nav[1]/a[3]",
        "hrefProduction": ["301 https://example.com/old-page", "200 https://example.com/target-route"],
        "hrefDevelopment": ["301 https://example.com/old-page", "200 https://example.com/target-page"]
      }
    ],
    "removed": [
      {
        "source": "https://example.com/",
        "xpath": "/html[1]/body[1]/footer[1]/a[2]",
        "hrefProduction": ["200 https://example.com/old-link"],
        "hrefDevelopment": null
      }
    ]
  },
  "override": null
}
```
*/

