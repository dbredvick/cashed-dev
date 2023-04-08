'use client'

import { useMemo } from 'react'

import { useAudioPlayer } from '@/components/AudioProvider'
import { PlayButton } from '@/components/player/PlayButton'

export default function Episode({ episode }) {

    let audioPlayerData = useMemo(
        () => ({
            title: episode.title,
            audio: {
                src: episode.audio.src,
                type: episode.audio.type,
            },
            link: `/${episode.id}`,
        }),
        [episode]
    )
    let player = useAudioPlayer(audioPlayerData)

    return (
        <PlayButton player={player} size="large" />
    )
}