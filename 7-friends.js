const choo = require('choo')
const html = require('choo/html')
const d3 = require('d3')
const app = choo()

app.model({
  state: {
    data: [4, 8, 15, 16, 23, 42],
    time: new Date().getTime()
  },
  reducers: {
    update: (data, state) => {
      const numbers = [];
      for (let i=0; i<10; i++) {
        numbers.push(Math.floor(Math.random() * 50) + 1);
      }
      return {
        time: new Date().getTime(),
        data: numbers
      }
    }
  },
  subscriptions: [
    (send, done) => {
      setInterval(() => {
        send('update', null, done)
      }, 1000)
    }
  ]
})

const timeView = (state, prev, send) => html`
  <p>${state.time}</p>
`

let memoizedEl = null
const dataVizBiz = (state, prev, send) => {
  function enter(el) {
    d3.select(el)
      .selectAll('div')
      .data(state.data)
      .enter()
      .append('div')
      .attr('class', 'bar')
      .style('transition', '.5s')
      .style('display', 'inline-block')
      .style('vertical-align', 'bottom')
      .style('height', (d)=> d + 'px')
      .style('width', '20px')
      .style('margin', '0 2px')
      .style('background', 'deepskyblue')
  }

  function update() {
    d3.selectAll('.bar')
      .data(state.data)
      .style('height', (d)=> d + 'px')
  }

  function unload() {
    memoizedEl = null
  }

  if (!memoizedEl) {
    memoizedEl = html`
      <div onload=${enter} onunload=${unload} style="height: 51px; line-height: 51px"></div>
    `
    return memoizedEl
  } else {
    update()

    const placeholder = html`<template></template>`
    placeholder.isSameNode = (el) => el.isSameNode(memoizedEl)
    return placeholder
  }
}

const myView = (state, prev, send) => html`
  <div>
    <h1>Sharing is caring</h1>
    ${timeView(state, prev, send)}
    <div>${dataVizBiz(state, prev, send)}</div>
    ${timeView(state, prev, send)}
  </div>
`

app.router(route => [
  route('/', myView)
])

const tree = app.start()
document.body.appendChild(tree)
