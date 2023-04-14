import Head from 'next/head'
import { notFound } from 'next/navigation'
import { parse } from 'rss-to-json'

import { Container } from '@/components/Container'
import { FormattedDate } from '@/components/FormattedDate'

import Episode from './episode'

import slugify from '@/lib/slugify'

export default async function Main({ params }) {
    let feed = await parse('https://feeds.transistor.fm/cashed-dev')
    console.log(feed)
    let episode = feed.items
        .map(({ title, description, content, enclosures, published }) => ({
            title: `${title}`,
            description,
            content,
            published,
            audio: enclosures.map((enclosure) => ({
                src: enclosure.url,
                type: enclosure.type,
            }))[0],
        }))
        .find(({ title }) => slugify(title) === params.slug)

    if (!episode) {
        return notFound()
    }

    let date = new Date(episode.published)

    return (
        <>
            <Head>
                <title>{`${episode.title} - Cashed.dev`}</title>
                <meta name="description" content={episode.description} />
            </Head>
            <article className="py-16 lg:py-36">
                <Container>
                    <header className="flex flex-col">
                        <div className="flex items-center gap-6">
                            <Episode episode={episode} />
                            <div className="flex flex-col">
                                <h1 className="mt-2 text-4xl font-bold text-slate-900">
                                    {episode.title}
                                </h1>
                                <FormattedDate
                                    date={date}
                                    className="order-first font-mono text-sm leading-7 text-slate-500"
                                />
                            </div>
                        </div>

                    </header>
                    <hr className="my-12 border-gray-200" />
                    <div
                        className="prose prose-slate mt-14 [&>h2:nth-of-type(3n)]:before:bg-violet-200 [&>h2:nth-of-type(3n+2)]:before:bg-indigo-200 [&>h2]:mt-12 [&>h2]:flex [&>h2]:items-center [&>h2]:font-mono [&>h2]:text-sm [&>h2]:font-medium [&>h2]:leading-7 [&>h2]:text-slate-900 [&>h2]:before:mr-3 [&>h2]:before:h-3 [&>h2]:before:w-1.5 [&>h2]:before:rounded-r-full [&>h2]:before:bg-cyan-200 [&>ul]:mt-6 [&>ul]:list-['\2013\20'] [&>ul]:pl-5"
                        dangerouslySetInnerHTML={{ __html: episode.content }}
                    />
                </Container>
            </article>
        </>
    )
}