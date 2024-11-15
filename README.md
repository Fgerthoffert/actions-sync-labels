<!-- markdownlint-disable MD041 -->
<p align="center">
  <img alt="ZenCrepesLogo" src="docs/zencrepes-logo.png" height="140" />
  <h2 align="center">Sync Labels</h2>
  <p align="center">Synchronize labels in bulk across a large number of repositories</p>
</p>

---

<div align="center">

[![GitHub Super-Linter](https://github.com/fgerthoffert/actions-sync-labels/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/fgerthoffert/actions-sync-labels/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/fgerthoffert/actions-sync-labels/actions/workflows/check-dist.yml/badge.svg)](https://github.com/fgerthoffert/actions-sync-labels/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/fgerthoffert/actions-sync-labels/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/fgerthoffert/actions-sync-labels/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

</div>

---

# About

The goal of this repository is to make it easier to get a large number of labels
in sync across multiple repositories of an organization. It uses a source
repository (for example: `.github`) and will repolicate its labels across all
selected repositories of an organization.

In short, creating a label in the .github will create it in all repositories of
the organization.

GitHub has a feature, in an organization settings, to make it possible to create
a set of labels automatically when new repositories are created, but this does
not handle already existing repositories or individuals labels creating
throughout the lifetime of repositories.

This actions makes it possible to perform the following across multiple
repositories:

- Create
- Update a label (change its color, its descrption). Including partial matching
  label names (for example updating all labels starting with `Area:`).
- Delete a label
- Rename a label

Repositories can be filtered by topics, this makes it possible to push labels to
a selected list of repositories.

## Currently unsupported

- Deletion matching a pattern (for example delete all labels starting with
  `Area:`).

## GitHub Rate Limits

The action will play gently with GitHub rate limits (it follow the
[official guidelines](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api)),
but it is potentially going to perform a large number of queries. Depending of
the number of repositories in your organization, running the action might
consume all credits for the user attached to the personal API token.

This is not necessarily an issue per se, but something to consider if that same
user is performing other API operations.

## Required privileges

The token used for performing the request must have the following scopes:
['read:org']

# Usage

This action is meant at being started manually (i.e. to instantly push a new
label) and on schedule (i.e. to regularly check that all labels with the same
name have the same color and description).

```yaml
name: Sync Labels

on:
  workflow_dispatch:
  schedule:
    - cron: '0 5 * * *'

jobs:
  sync-labels:
    runs-on: ubuntu-latest
    steps:
      - name: Synchronize labels
        # Replace main by the release of your choice
        uses: fgerthoffert/actions-sync-labels@main
        with:
          org: zencrepes
          token: YOUR_TOKEN
          src_repository: .github
          filter_topics: product,community
          filter_operator: AND
```

## Filtering Repositories

You can filter which repositories are going to be impacted by label changes.
This is done via the "filter_topics" and "filter_operator" parameters.

Specifying `EMPTY` as a filter_topics makes it possible to include repositories
without topics.

For example:

```yaml
filter_topics: product,EMPTY
filter_operator: OR
```

Will manage labels on all repositories with the "product" topic or without
topics at all.

## Create labels

Simply create a label in the source repository, it will be replicated
automatically to all repositories.

## Delete Labels

Deleting a label is done by attaching a particular "delete tag" (by default
`_delete_`) to a label in the source repository.

For example, if you create the label `_delete_help wanted` in the `.github`
repository, the label `help wanted` will be automatically removed. Once removal
has been done, you can delete `_delete_help wanted` from the `.github`
repository

If labels are often created by mistake, you could also use this mechanism as a
way to blacklist particular labels and get them automatically removed (when the
action is triggered on cron).

Note: Since we want to keep the ability for repositories to have unique labels,
it is not possible to automatically delete from all repos labels absent from the
source repository, thus relying on a delete.

## Rename Labels

You can rename labels via a particular "rename tag" (by default `_rename_`) to a
label in the source repository.

For example, if you create the label `bugs_rename_bug` in the `.github`
repository, the label `bugs` will be automatically be renamed to `bug`.

Watch-out for already existing labels though, the system will not attempt to
rename a label if the new name is already taken, it will display a warning
instead.

## Update Labels

If you update an existing label in the source repository, it will be
automatically updated on all repositories.

A partial match mechanism is available (via a "partial match tag", by default
`_partial_`) if you are using a particular formatting to carry meaning. This
makes it possible to apply the same color and description to all labels using
the same formation.

For example `_partial_Area:` will automatically align (color and description)
all labels across all repositories containing the text "Area:".

# :gear: Configuration

## Input Parameters

The following input parameters are available:

| Parameter          | Default             | Description                                                                                                                                                                                                       |
| ------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| org                |                     | A GitHub organization to use                                                                                                                                                                                      |
| token              |                     | A GitHub Personal API Token with the correct scopes (see above)                                                                                                                                                   |
| max_query_nodes    | `30`                | Maximum number of GraphQL nodes to fetch in one single API call to GitHub API                                                                                                                                     |
| src_repository     | `.github`           | Repository containing the source of truth for labels                                                                                                                                                              |
| tag_delete         | `_delete_`          | Tag to use to identify labels to delete                                                                                                                                                                           |
| tag_rename         | `_rename_`          | Tag to use to identify labels to rename                                                                                                                                                                           |
| tag_partial        | `_partial_`         | Tag to use to identify labels to update when aiming to partially match the label name                                                                                                                             |
| filter_topics      |                     | A comma separated (no space) list of topics to filter repositories by before fetching all the data. You can specify the "EMPTY", for example to filter by repositories with the "tooling" topic OR without topics |
| filter_operator    | AND                 | Default operator to apply on filters. Can take "OR" or "AND"                                                                                                                                                      |
| artifact_filename  | repositories.ndjson | Actual filename that will be use to save the file on disk. run                                                                                                                                                    |
| artifact_name      | repositories.ndjson | Name fo the GitHub artifact that will be generated during the run                                                                                                                                                 |
| artifact_retention | 2                   | Number of retention days for the artifact                                                                                                                                                                         |

## Outputs

The following outputs are available:

| Name              | Description                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| artifact_filepath | The filepath, on the local filesystem, where the JSON file is saved. This is useful to perform operations on that JSON in following steps within the same job. |

# How to contribute

- Fork the repository
- npm install
- Rename .env.example into .env
- Update the INPUT\_ variables
- Do your changes
- npx local-action . src/main.ts .env
- npm run bundle
- npm test
- PR into this repository, detailing your changes

More details about GitHub TypeScript action are
[available here](https://github.com/actions/typescript-action)
