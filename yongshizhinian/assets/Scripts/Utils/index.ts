import { Component, _decorator, Node, UITransform, Layers, SpriteFrame, math, sp } from "cc";
export const createNewNode = (name: string = '') => {
    const node = new Node()
    const transfrom = node.addComponent(UITransform)
    transfrom.setAnchorPoint(0, 1)

    node.layer = 1 << Layers.nameToLayer('UI_2D')
    return node
}

export const randomTileByrange = (start: number, end: number) => {
    return Math.floor(Math.random() * (start + (end - start)))
}


const getNumByName = (spname) => {
    const match = `${spname}`.match(/(\d+)(?!.*\d)/)
    if (!match) {
        return 0
    }
    return parseInt(match[1], 10) || 0
}

export const sortSpriteFrame = (spFrames) => {
    let arr = []
    for (const key in spFrames) {
        spFrames[key].name = key
        arr.push(spFrames[key])
    }
    return arr.sort((a, b) => getNumByName(a.name) - getNumByName(b.name))
}

export const randomNameByLen = (len: number) => {
    return Array.from({ length: len }).reduce<string>((total, item) => total + Math.floor(Math.random() * 10), '')
}
