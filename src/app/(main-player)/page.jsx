import Episodes from './episodes'

import { parse } from 'rss-to-json'


export default async function App({ Component, pageProps }) {

    let feed = await parse('https://their-side-feed.vercel.app/api/feed')

    const episodes = feed.items.map(
        ({ id, title, description, enclosures, published }) => ({
            id,
            title: `${id}: ${title}`,
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