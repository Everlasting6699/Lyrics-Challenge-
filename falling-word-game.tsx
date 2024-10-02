"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from "@/components/ui/button"

type Lyric = {
  text: string
  words: string[]
  color: string
}

const LEVELS = [
  {
    lyrics: [
      { text: "你是我的眼", words: ['你', '是', '我的', '眼'] },
      { text: "我应该在车底", words: ['我', '应该', '在', '车底'] },
      { text: "九妹九妹漂亮的妹妹", words: ['九妹', '九妹', '漂亮的', '妹妹'] }
    ],
    speed: 1000
  },
  {
    lyrics: [
      { text: "更怕你永远停留在这里", words: ['更', '怕', '你', '永远', '停留', '在', '这里'] },
      { text: "丑八怪千万别把灯打开", words: ['丑八怪', '千万', '别', '把', '灯', '打开'] },
      { text: "我爱你爱着你就像老鼠爱大米", words: ['我', '爱', '你', '爱着', '你', '就像', '老鼠', '爱', '大米'] },
      { text: "情深深雨蒙蒙多少楼台烟雨中", words: ['情深深', '雨蒙蒙', '多少', '楼台', '烟雨', '中'] },
      { text: "你永远不懂我的黑像白天不懂夜的黑", words: ['你', '永远', '不懂', '我的', '黑', '像', '白天', '不懂', '夜的', '黑'] }
    ],
    speed: 800
  },
  {
    lyrics: [
      { text: "有没有那么一首歌", words: ['有没有', '那么', '一首', '歌'] },
      { text: "能不能再给我一首歌的时间", words: ['能不能', '再给', '我', '一首', '歌', '的', '时间'] },
      { text: "你到底爱不爱我？", words: ['你', '到底', '爱', '不爱', '我？'] },
      { text: "我看透了他的心还有别人逗留的背影", words: ['我', '看透了', '他的', '心', '还有', '别人', '逗留', '的', '背影'] },
      { text: "东京下雨淋湿巴黎收音机", words: ['东京', '下雨', '淋湿', '巴黎', '收音机'] },
      { text: "窗外的麻雀在电线杆上多嘴", words: ['窗外', '的', '麻雀', '在', '电线杆', '上', '多嘴'] },
      { text: "但偏偏风渐渐把距离吹的很远", words: ['但', '偏偏', '风', '渐渐', '把', '距离', '吹的', '很远'] },
      { text: "多少的日子里总是一个人面对着天空发呆", words: ['多少', '的', '日子里', '总是', '一个人', '面对着', '天空', '发呆'] }
    ],
    speed: 600
  }
]

type FallingWord = {
  id: number
  word: string
  top: number
  left: number
  lyricIndex: number
}

function generateRandomColor() {
  return `hsl(${Math.random() * 360}, 70%, 80%)`
}

export default function FallingWordGame() {
  const [level, setLevel] = useState(0)
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([])
  const [completedLyrics, setCompletedLyrics] = useState<number[]>([])
  const [currentLyric, setCurrentLyric] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameOver, setGameOver] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [errorMessage, setErrorMessage] = useState("")

  const lyrics = useMemo(() => {
    return LEVELS[level].lyrics.map(lyric => ({
      ...lyric,
      color: generateRandomColor()
    }))
  }, [level])

  const resetGame = useCallback(() => {
    setLevel(0)
    setFallingWords([])
    setCompletedLyrics([])
    setCurrentLyric([])
    setTimeLeft(60)
    setGameOver(false)
    setWordCount(0)
    setErrorMessage("")
  }, [])

  const addFallingWord = useCallback(() => {
    if (completedLyrics.length === 3) return

    const availableLyrics = lyrics.filter((_, index) => !completedLyrics.includes(index))
    if (availableLyrics.length === 0) return

    const randomLyricIndex = Math.floor(Math.random() * availableLyrics.length)
    const lyric = availableLyrics[randomLyricIndex]
    const word = lyric.words[Math.floor(Math.random() * lyric.words.length)]

    setFallingWords(prev => [
      ...prev,
      {
        id: wordCount,
        word,
        top: 0,
        left: Math.random() * (window.innerWidth - 100),
        lyricIndex: lyrics.indexOf(lyric)
      }
    ])
    setWordCount(prev => prev + 1)
  }, [lyrics, completedLyrics, wordCount])

  useEffect(() => {
    if (gameOver) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer)
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver])

  useEffect(() => {
    if (gameOver) return

    const wordInterval = setInterval(addFallingWord, LEVELS[level].speed)
    const fallInterval = setInterval(() => {
      setFallingWords(prev => prev.map(word => ({
        ...word,
        top: word.top + 5
      })).filter(word => word.top < window.innerHeight))
    }, 50)

    return () => {
      clearInterval(wordInterval)
      clearInterval(fallInterval)
    }
  }, [level, gameOver, addFallingWord])

  const handleWordClick = (clickedWord: FallingWord) => {
    const currentLyricObj = lyrics[clickedWord.lyricIndex]
    if (currentLyricObj.words[currentLyric.length] === clickedWord.word) {
      setCurrentLyric(prev => [...prev, clickedWord.word])
      setFallingWords(prev => prev.filter(word => word.id !== clickedWord.id))
      setErrorMessage("")

      if (currentLyricObj.words.join('') === [...currentLyric, clickedWord.word].join('')) {
        setCompletedLyrics(prev => [...prev, clickedWord.lyricIndex])
        setCurrentLyric([])

        if (completedLyrics.length === 2) {
          if (level === 2) {
            setGameOver(true)
          } else {
            setLevel(prev => prev + 1)
            setCompletedLyrics([])
            setTimeLeft(60)
          }
        }
      }
    } else {
      setCurrentLyric([])
      setErrorMessage("Wrong word! Start the lyric again.")
      setTimeout(() => setErrorMessage(""), 2000)
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-100">
      <div className="absolute top-0 left-0 p-4 z-10">
        <div className="text-xl font-bold">Level: {level + 1}</div>
        <div className="text-xl font-bold">Time: {timeLeft}s</div>
      </div>
      
      {fallingWords.map(word => (
        <div
          key={word.id}
          className={`absolute px-2 py-1 rounded cursor-pointer`}
          style={{ 
            top: `${word.top}px`, 
            left: `${word.left}px`,
            backgroundColor: lyrics[word.lyricIndex].color
          }}
          onClick={() => handleWordClick(word)}
        >
          {word.word}
        </div>
      ))}

      <div className="absolute bottom-0 left-0 w-full p-4 bg-white">
        <div className="text-center text-xl font-bold mb-2">
          {currentLyric.join(' ')}
        </div>
        {errorMessage && (
          <div className="text-center text-red-500 mb-2">{errorMessage}</div>
        )}
        <div className="flex flex-wrap justify-around">
          {lyrics.map((lyric, index) => (
            <div
              key={index}
              className={`px-2 py-1 rounded mb-2 ${completedLyrics.includes(index) ? 'line-through' : ''}`}
              style={{ backgroundColor: lyric.color }}
            >
              {lyric.text}
            </div>
          ))}
        </div>
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded">
            <h2 className="text-2xl font-bold mb-4">Game Over</h2>
            <p className="mb-4">You reached level {level + 1}</p>
            <Button onClick={resetGame}>Play Again</Button>
          </div>
        </div>
      )}
    </div>
  )
}