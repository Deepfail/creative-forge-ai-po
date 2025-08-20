import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useKV } from '@github/spark/hooks'
const defaultPrompts = {

Name: {name}
  'character-creation': `Create a detailed NSFW character based on the following details:

Generate a c
2. Persona
4. Backgroun
6. Their goals and motivat
Make the description vivid, engaging, and s
  'scenario-creation': `
Setting: {setting}
Theme: {theme}

Generate a comprehensive character profile including:
1. Detailed physical appearance
2. Personality traits and quirks
3. Sexual preferences and kinks
4. Background story
5. How they interact with others
6. Their goals and motivations

Make the description vivid, engaging, and suitable for adult roleplay scenarios.`,

  'scenario-creation': `Create an immersive NSFW scenario based on these parameters:

Setting: {setting}
Characters: {characters}
Theme: {theme}
Tone: {tone}
Kinks: {kinks}
Plot Elements: {plotElements}

  const clearStorage = () => {
    toast.success('Storage clea

    <div className="space-y-4">
        <CardHeader>
        </CardHeader>
          <div class

            <Button onClick={clearStorage} variant="destructive">

          

        </Card

}






















  const clearStorage = () => {





    <div className="space-y-4">

        <CardHeader>

        </CardHeader>





            <Button onClick={clearStorage} variant="destructive">



          







}