// @refresh reload
import './root.css'

import { GlitchEffect, GlitchMode, SepiaEffect } from 'postprocessing'
import { createControls } from 'solid-leva'
import { OrbitControls } from './lib/OrbitControls'
import { Canvas, T, useFrame } from 'solid-three'

import { Outline, Select, Selection, EffectComposer, Pixelation, wrapEffect } from './modules/solid-postprocessing'

import * as React from 'react'
import { Html } from './lib/Html'
import { Stats } from './components/Stats'
import { Route, Router, Routes } from '@solidjs/router'
import { Chess } from './routes/chess'
import PaperBoats from './routes/paper-boat'
import ShipPage from './routes/fleet'
import { Headless, usePerfStore } from './perf'
import { getGame } from '~/lib/game'
import { TheatreProvider } from './components/theatre'

export type Props = {
  showPanel?: number
  className?: string
  parent?: React.RefObject<HTMLElement>
}

const Sepia = wrapEffect(SepiaEffect)

function Light() {
  const lightControls = createControls('light', {
    position: [-35, 29, 10],
    color: '#020910',
    camera: [0, 15, 5],
    angle: 2,
    intensity: 1,
  })
  return (
    <>
      <T.SpotLight
        penumbra={1.5}
        position={lightControls.position}
        angle={lightControls.angle}
        intensity={lightControls.intensity}
        castShadow
      />
    </>
  )
}
const context = createContext()

function Perf() {
  let div
  // useFrame(() => {
  //   let perf = usePerfStore.getState()
  //   div.innerHTML = JSON.stringify({ log: perf.log, program: perf.programs.size }, null, 2)
  // })
  return null
  return (
    <Html>
      <pre ref={div}></pre>
    </Html>
  )
}

function App() {
  const [signals, setSignals] = createSignal([])
  return (
    <div style="width: 100vw;height:100vh">
      <context.Provider value={{ signals, setSignals }}>
        <Canvas
          shadows
          onPointerMissed={(e) => {
            getGame().hoveredSquare = 'none'
          }}>
          <Headless trackCPU={true} deepAnalyze={true} />
          <Perf />
          {/* <Html>
            <div style="position:absolute;top:-50vh;">
              <a href="/" style="margin-right:4px">
                Home
              </a>
              <a href="/chess" style="margin-right:4px">
                Chess
              </a>
              <a href="/ship">Ship</a>
            </div>
          </Html> */}
          <Selection>
            <Routes>
              <Route path="/chess" component={Chess} />
              <Route path="/basketball" component={Chess} />
              <Route path="/paper-boat" component={PaperBoats} />
              <Route path="/fleet" component={ShipPage} />
            </Routes>
            <T.AmbientLight intensity={0.5} />
            <Light />
            {/* <T.AxesHelper scale={10} /> */}
            {/* <T.GridHelper /> */}
            <OrbitControls makeDefault />
            {/* <EffectComposer autoClear={false}>
              <Outline edgeStrength={2} />
            </EffectComposer> */}
            {/* <Stats /> */}
          </Selection>
        </Canvas>
      </context.Provider>
    </div>
  )
}

function Box() {
  return (
    <T.Group position={4}>
      <Counter />
      {/* <T.Mesh ref={ref} onPointerDown={console.log}>
        <T.BoxBufferGeometry />
        <T.MeshStandardMaterial />
      </T.Mesh> */}
    </T.Group>
  )
}

function createAwesomeSignal(name, v) {
  const [sig, setSig] = createSignal(v)

  const { setSignals } = useContext(context)

  createEffect(() => {
    setSignals((l) => [
      ...l,
      {
        name: 'count',
        signal: sig,
        setSignal: setSig,
      },
    ])
  })

  let getsig = () => {
    const c = useContext(elementContext)
    if (c) {
      c.subscribe({
        name: 'count',
        signal: sig,
        setSignal: setSig,
      })
    }
    return sig()
  }
  return [getsig, setSig]
}

function Counter() {
  const [count, setCount] = createAwesomeSignal('count', 0)

  return (
    <Html occlude transform style={{ color: 'red' }}>
      <Div>
        {count()}
        <Div>{count()}</Div>
      </Div>
      <button onClick={() => setCount((c) => ++c)}>Increment</button>
    </Html>
  )
}

const elementContext = createContext()

function Div(props) {
  let ref
  const [sigs, setSigs] = createSignal([])
  return (
    <elementContext.Provider
      value={{
        subscribe: (el) => {
          setSigs((l) => [...l.filter((l) => l.name != el.name), el])
        },
      }}>
      <div ref={ref} style={{ position: 'relative' }}>
        {props.children}
        <div>
          <For each={sigs()}>{(s) => <span>{s.name}</span>}</For>
        </div>
      </div>
    </elementContext.Provider>
  )
}

render(
  () => (
    <Router>
      <TheatreProvider />
      <App />
    </Router>
  ),
  document.getElementById('root'),
)
