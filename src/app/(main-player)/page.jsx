import Episodes from './episodes'

import { parse } from 'rss-to-json'


export default async function App({ Component, pageProps }) {

    let feed = await parse('https://feeds.transistor.fm/cashed-dev')

    const episodes = feed.items.map(
        ({ title, description, enclosures, published }) => ({
            title: `${title}`,
            published,
            description,
            audio: enclosures.map((enclosure) => ({
                src: enclosure.url,
                type: enclosure.type,
            }))[0],
        })
    )





    return (
        <Episodes episodes={episodes} />
    )
}