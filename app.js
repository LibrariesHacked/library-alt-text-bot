import * as fs from 'fs'
import Twitter from 'twitter-lite'
import 'dotenv/config'

const delay = ms => new Promise(res => setTimeout(res, ms))

let counter = 0

try {
  var counterData = fs.readFileSync('counter', 'utf8')
  counter = parseInt(counterData.toString())
} catch (e) {}

const app = new Twitter({
  version: '2',
  extension: false,
  bearer_token: process.env.BEARER_TOKEN
})

const user = new Twitter({
  access_token_key: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_SECRET,
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET
})

// These are Twitter Lists of library accounts, managed by SarahHLib
const lists = [
  //{ listname:'uk-libraries', id: '973903152499036160' },
  //{ listname:'non-uk-libraries', id: '874267472064651264' },
  //{ listname:'uk-sch-fe-lib', id: '866586695713656833' },
  //{ listname:'other-libraries-uk', id: '865613485127946241' },
  //{ listname:'national-libraries', id: '865613046831616000' },
  //{ listname:'uk-public-libraries', id: '865611336323039232' },
  //{ listname:'uk-academic-libraries', id: '865604910699642880' },
  //{ listname:'uk-med-libraries', id: '865597171596484609' },
  //{ listname:'uk-mobile-libraries', id: '1111219227619442688' },
  { listname: 'list-testing', id: '1517219733124362241' }
]

let tweets = []
let mediaItems = []
let users = []

for (const twitterList of lists) {
  const apiUrl = 'lists/' + twitterList.id + '/tweets'
  let params = {
    expansions: 'author_id,attachments.media_keys',
    'media.fields': 'alt_text',
    'tweet.fields': 'referenced_tweets'
  }
  let nextToken = ''
  do {
    try {
      if (nextToken !== '') params.pagination_token = nextToken

      nextToken = ''
      const { meta, data, includes } = await app.get(apiUrl, params)

      const breakLoop =
        data.filter(tweet => parseInt(tweet.id) < counter).length > 0
      if (meta && meta.next_token && !breakLoop) nextToken = meta.next_token

      tweets = tweets.concat(data)
      if (includes.media) mediaItems = mediaItems.concat(includes.media)
      if (includes.users) users = users.concat(includes.users)
    } catch (err) {}
  } while (nextToken !== '')
}

const uniqueTweets = [...new Map(tweets.map(item => [item.id, item])).values()]
const uniqueMedia = [
  ...new Map(mediaItems.map(item => [item.media_key, item])).values()
]
const uniqueUsers = [...new Map(users.map(item => [item.id, item])).values()]

const tweetsWithNoAltText = uniqueTweets.filter(tweet => {
  let countImagesWithNoAltText = 0
  if (
    !tweet.referenced_tweets &&
    tweet.attachments &&
    tweet.attachments.media_keys &&
    tweet.id > counter
  ) {
    for (const mediaKey of tweet.attachments.media_keys) {
      const media = uniqueMedia.find(item => item.media_key === mediaKey)
      if (media && media.type === 'photo' && !media.alt_text)
        countImagesWithNoAltText++
    }
  }
  tweet.countImagesWithNoAltText = countImagesWithNoAltText
  tweet.user = uniqueUsers.find(item => item.id === tweet.author_id)
  return countImagesWithNoAltText > 0
})

if (tweetsWithNoAltText.length > 0) {
  counter = Math.max.apply(
    Math,
    tweetsWithNoAltText.map(t => parseInt(t.id))
  )
  fs.writeFileSync('counter', counter.toString(), {
    encoding: 'utf8',
    flag: 'w'
  })
}

for (const tweet of tweetsWithNoAltText) {
  const imageCount = tweet.countImagesWithNoAltText
  var tweetText =
    'This tweet contains ' +
    imageCount.toString() +
    (imageCount === 1 ? ' image' : ' images') +
    ' with no alt text.\n\nAlt text is important for blind and partially sighted people who use screen readers. More info at https://gcs.civilservice.gov.uk/guidance/digital-communication/planning-creating-and-publishing-accessible-social-media-campaigns/#Accessibility-best-practice-for-community-managers-and-publishers'
  try {
    const { data } = await user.post('statuses/update', {
      status: tweetText,
      attachment_url: `https://twitter.com/${tweet.user.username}/status/${tweet.id}`
    })
    await delay(2000)
  } catch (err) {}
}
