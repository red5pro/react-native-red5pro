# Contributing

When contributing to this repository, please follow the guidelines below.

<br>

## Table of Contents

- [General](#general)
  - [Folder and File Names](#folder-and-file-names)
  - [Documents](#documents)
  - [Spikes](#spikes)
- [Version Control](#version-control)
  - [Branch Names](#branch-names)
  - [Branches Lifetime](#branches-lifetime)
  - [Integration](#integration)
  - [Commits](#commits)
  - [Commit Messages](#commit-messages)
  - [Pull Requests](#pull-requests)
- [Code Management](#code-management)
  - [Code Format](#code-format)
  - [Unit Tests](#unit-tests)
  - [Integration Tests](#integration-tests)


<br>
<br>

## General

### Folder and File Names

#### Folder Names

Folder names must comply with the following rules:

* **Alphanumeric**
* **Lowercase**
* **Hyphen ("-") instead of spaces (" ")**

Incorrect examples:

* "API"
* "this is a folder"

Correct examples:

* "api"
* "this-is-a-folder"

#### File Names

File names must comply with the following rules:

* **Alphanumeric**
* **Hyphen ("-") instead of spaces (" ")**

Incorrect examples:

* "This Is A File"
* "another file"

Correct examples:

* "ThisIsAFile"
* "anotherFile"

<br>

### Documents

Every document added to the repository must be placed inside the `/docs` folder in Markdown (`.md`) format. The purpose of using Markdown format is to keep track of documentation changes easily. Document images must be placed inside the `/docs/images` with the name containing the document name as prefix (e.g. if the image name is "database-diagram" and the document name is "general-architecture" then the correct image name would be "general-architecture-database-diagram").

<br>

### Spikes

Spikes must be placed inside the `/spikes` folder. Every spike must have its own folder with a **README.md** file composed of the following sections:

* **Overview:** Purpose of the spike.
* **{Tool/Library/Framework}:** Replace this title by the name of the tool/library/framework being tested and complete with information and links.
* **Running the spike**
  * **Prerequisites:** List of necessary tools to run the spike.
  * **Steps:** Step-by-step guide on how to run the spike.
* **Conclusion:** Conclusion on whether its convenient to implement the tool within the system or not.

<br>
<br>

## Version Control 

### Branch Names

The branch name must have the following structure:

`features/{USER-STORY-ID}-{DESCRIPTION}`

The **DESCRIPTION** must comply with the following rules:

* **Alphabetic**
* **Lowercase**
* **Hyphen ("-") instead of spaces (" ")**
* **No more than 30 characters long**

Examples:

* `features/123-contributing-guidelines`
* `features/456-post-users-endpoint`

<br>

### Branches Lifetime

Every branch that has already been integrated into the main branch, must be deleted both locally and remotely, to avoid branch cluttering.

<br>

### Integration

When integrating changes from one branch into another, always use **rebase** instead of **merge**. The purpose is to keep a linear (and clearer) commit history.

<br>

### Commits

When submitting a branch for review, all commits should be squashed into a single commit, unless it is necessary to make a distinction between changes made in the same feature branch.

<br>

### Commit Messages

Commit messages must comply with the following rules:

1. Message length must have no more than 100 characters
2. Message must be lowercase
3. Message must not end with a period
4. Message must have the following structure: **category - action - description**
  
**Category** 

The category identifies the EPIC user story to which the change introduced in the commit is associated, and can be one of the following:

  * `[documentation]`

**Actions**

The action identifies the type of change introduced in the commit, and can be one of the following:

  * `add`
  * `update`
  * `move`
  * `remove`
  * `fix`

**Examples**

Below you can find some examples of correct commit messages:

```shell
git commit -m "[documentation] - add - contributing guidelines document"
```

```shell
git commit -m "[documentation] - update - README to include troubleshooting section"
```

<br>

### Pull Requests

#### Title

The pull request title must have the following structure: 

`{USER-STORY-TITLE} | {USER-STORY-ID}`

For example:

`AAC, I have a POST /users endpoint to submit new users | 123`

#### Description

The pull request description must follow the structure defined in the corresponding template:

* [Feature](/docs/pr-description-templates/pr-description-feature-template.md)
* [Documentation](/docs/pr-description-templates/pr-description-documentation-template.md)
* [Bug](/docs/pr-description-templates/pr-description-bug-template.md)

<br>
<br>

## Code Management

### Code Format

TBD

<br>

### Unit Tests

TBD

<br>

### Integration Tests

TBD
