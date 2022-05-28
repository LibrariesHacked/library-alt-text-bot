# Library alt text bot

This bot finds tweets from library accounts that include images without alt text. It quote tweets these with useful guidance on creating accessible social media.

## Getting Started

These instructions will give you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on deploying the project on a live system.

### Prerequisites

The project uses NodeJS and the [Twitter API](https://developer.twitter.com/en/docs/tweets/tweet-updates) which requires a [Twitter API key](https://developer.twitter.com/en/apps).

- [Node JS](https://nodejs.org)

### Installing

Assuming you have Node.js installed, you can install the project dependencies by running:

```console
npm install
```

### Running the Bot

For the bot to work it requires Twitter API keys for an account with permission to use the Twitter API. You can get these keys from your Twitter developer account.

Rename the `.env.sample` file to `.env` and add your Twitter API keys.

The bot can then be run using the following command:

```console
node app.js
```

## Deployment

The bot is deployed by using GitHub Actions. The bot is configured to run on a 15 minute schedule and push the latest tweet processed to this reository in the [counter](counter) file.

```yaml
  # Runs every 30 minutes during the day
  schedule:
    - cron: '*/30 6-20 * * *'
```

## Authors

  - **Libraries Hacked** - *Repository setup and coding* - [DaveBathnes](https://github.com/DaveBathnes)

See also the list of [contributors](https://github.com/LibrariesHacked/library-alt-text-bot/contributors) who participated in this project.

## License

This project is licensed under the [MIT](LICENSE) license.

## Acknowledgments

  - [Library Cactus](https://twitter.com/SarahHLib) who maintains Twitter lists of library accounts.
  - [Matt Eason](https://twitter.com/matteason) who created the [UKGovAltBot](https://twitter.com/UKGovAltBot) and other alt bot accounts.

