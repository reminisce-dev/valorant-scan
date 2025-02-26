# Valorant Scan

Valorant Scan is a Node.js application that fetches Valorant match results and posts updates to [Bluesky](https://bsky.social). Match data is from [vlr.gg](https://vlr.gg) but used [vlrggapi](https://github.com/axsddlr/vlrggapi).

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Testing](#testing)
- [Contributors](#contributors)
- [Credits](#credits)

## Installation

1.  Clone the repository and install dependencies.

```bash
  git clone https://github.com/reminisce-dev/valorant-scan.git
  cd valorant-scan
```

2.  Create a `.env` file and configure it with bluesky credentials.

```ini
  BLUESKY_USERNAME=your_username
  BLUESKY_PASSWORD=your_password
  PORT=3000
```

## Usage

Run the application

```bash
npx tsx index.ts
```

This will log into the provided bluesky account and begin fetching Valorant match results every 3 minutes. Results will be posted to the connected bluesky account if new match data is available.

## Features

- Fetches Valorant match results from [vlrggapi](https://github.com/axsddlr/vlrggapi).
- Formats and posts results to Bluesky.
- Automatically updates every 3 minutes.
- Simple web server to indicate service status.

## Testing

To run tests:

```bash
  cd valorant-scan/tests
  npm test
```

Tests are written using Jest.

## Contributors

- [@reminisce-dev](https://www.github.com/reminisce-dev)

## Credits

2025

- [Unofficial VLR.gg API](https://github.com/axsddlr/vlrggapi) - Used for fetching Valorant match results.

## License

[MIT](https://choosealicense.com/licenses/mit/)
