import slugify from '@/lib/slugify';
import { ImageResponse } from 'next/server';
const { XMLParser } = require("fast-xml-parser");

export const size = { width: 1200, height: 600 };
export const alt = 'About this episode of Cashed.dev';
export const contentType = 'image/png';


export const runtime = 'edge'

// function parseXML(xmlString) {
//     const tagPattern = /<([^>]+)>([\s\S]*?)<\/\1>/g;
//     const tagContents = /<([^>]+)>([\s\S]*?)<\/\1>/;
//     const xmlnsPattern = /xmlns:\w+="[^"]+"/g;
//     const cdataPattern = /<!\[CDATA\[(.*?)]]>/g;

//     const parseNode = (str) => {
//         const matches = str.match(tagContents);
//         if (matches) {
//             const tagName = matches[1].split(':').pop();
//             const content = matches[2];
//             return { tagName, content };
//         }
//         return null;
//     };

//     const cleanedXmlString = xmlString
//         .replace(xmlnsPattern, '')
//         .replace(cdataPattern, '$1');

//     const xmlNodes = cleanedXmlString
//         .match(tagPattern)
//         .map(parseNode)
//         .filter((node) => node);

//     const result = {};
//     xmlNodes.forEach((node) => {
//         if (!result[node.tagName]) {
//             result[node.tagName] = [];
//         }
//         result[node.tagName].push(node.content);
//     });

//     return result;
// }

async function parseXML(data) {
    const parser = new XMLParser();
    const options = {
        attributeNamePrefix: '',
        attrNodeName: 'attributes',
        ignoreAttributes: false,
    };

    return parser.parse(data, options);
}


async function parseRSS(url) {
    try {
        const response = await fetch(url);

        if (response.ok) {
            const data = await response.text();
            const xmlDoc = await parseXML(data);
            const items = xmlDoc.rss.channel.items ? xmlDoc.rss.channel.items : [xmlDoc.rss.channel.item];
            console.log('items', items)
            const result = [];

            for (let i = 0; i < items.length; i++) {
                const itemXML = items[i];
                const title = itemXML.title;
                const link = itemXML.link;
                const description = itemXML.description;
                const pubDate = itemXML.pubDate ? itemXML.pubDate : null;

                result.push({ title, link, description, pubDate });
            }

            return result;
        } else {
            throw new Error('Network error');
        }
    } catch (error) {
        console.error('Error fetching RSS feed:', error);
    }
}

function randomBetween(min, max, seed = 1) {
    return () => {
        let rand = Math.sin(seed++) * 10000
        rand = rand - Math.floor(rand)
        return Math.floor(rand * (max - min + 1) + min)
    }
}

export function Waveform(props) {
    let id = 'waveform'
    let bars = {
        total: 100,
        width: .4,
        gap: .2,
        minHeight: 40,
        maxHeight: 100,
    }

    let barHeights = Array.from(
        { length: bars.total },
        randomBetween(bars.minHeight, bars.maxHeight)
    )


    return (
        <svg aria-hidden="true" {...props}>
            <defs>
                <linearGradient id={`${id}-fade`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="40%" stopColor="white" />
                    <stop offset="100%" stopColor="black" />
                </linearGradient>
                <linearGradient id={`${id}-gradient`}>
                    <stop offset="0%" stopColor="#2DD4BF" />
                    <stop offset="50%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#4ADE80" />
                </linearGradient>
                <mask id={`${id}-mask`}>
                    <rect width="100%" height="100%" fill={`url(#${id}-pattern)`} />
                </mask>
                <pattern
                    id={`${id}-pattern`}
                    width={bars.total * bars.width + bars.total * bars.gap}
                    height="100%"
                    patternUnits="userSpaceOnUse"
                >
                    {Array.from({ length: bars.total }, (_, index) => (
                        <rect
                            key={index}
                            width={bars.width}
                            height={`${barHeights[index]}%`}
                            x={bars.gap * (index + 1) + bars.width * index}
                            fill={`url(#${id}-fade)`}
                        />
                    ))}
                </pattern>
            </defs>
            <rect
                width="100%"
                height="100%"
                fill={`url(#${id}-gradient)`}
                mask={`url(#${id}-mask)`}
                opacity="0.25"
            />
        </svg>
    )
}


export default async function og(req) {
    const data = await parseRSS('https://feeds.transistor.fm/cashed-dev');

    const feed = data;

    console.log(feed);

    const title = "Cashed.dev";
    const description = "Weekly conversations about the business of starting a software company."

    const currentEpisode = feed.find((item) => slugify(item.title) === slugify(req.params.slug));

    const episodeTitle = currentEpisode.title;

    return new ImageResponse(
        <
            div
            tw="justify-between"
            style
            =
            {{
                height
                    :

                    '100%'
                ,
                width
                    :

                    '100%'
                ,
                display
                    :

                    'flex'
                ,
            }}

        >
            <img tw="w-[640px]" src={"https://cashed.dev/poster.png"} />

            <div tw="flex w-full flex-1 flex-wrap">
                <Waveform tw="absolute left-0 top-0 h-40 w-full" />
                <h1 tw="ml-4 mt-48 text-4xl font-bold tracking-tight ">
                    {title}
                </h1>
                <h3 tw="mt-4 ml-4">{description}</h3>
                <h1 tw="ml-4 mt-12 text-6xl font-bold tracking-tight">
                    {episodeTitle}
                </h1>
            </div>

        </div >
    );
}