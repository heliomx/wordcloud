import * as THREE from 'three'
import { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, TrackballControls } from '@react-three/drei'
//import randomWord from 'random-words'
const terms = [
  'DEEM 2025 Benefit Guide',
  'Marriage',
  'Divorce',
  'Birth of a child',
  'Spouse',
  'Enrolled dependents',
  'Eligibility',
  'Plan requirements',
  'Affordable Care Act',
  'Federal',
  'State',
  'Plan Notices',
  'PlanSource',
  'Username',
  'SSN',
  'Initials',
  'Password',
  'HR@deemfirst.com',
  'Birthdate',
  'Social security numbers',
  'Marriage license',
  'Birth certificate',
  'Enroll Online',
  'Health care needs',
  'Financial relief',
  'Peace of mind',
  'Routine health care',
  'Unexpected health crisis',
  'Family',
  'Times of need'
]
let remainingTerms = [...terms]

function randomWord() {
  if (remainingTerms.length === 0) {
    remainingTerms = [...terms]
  }
  const randomIndex = Math.floor(Math.random() * remainingTerms.length)
  return remainingTerms.splice(randomIndex, 1)[0]
}

function Word({ children, setResponseVisibility, ...props }) {
  console.log({ setResponseVisibility })
  const color = new THREE.Color()
  const fontProps = { font: '/Inter-Bold.woff', fontSize: 0.8, letterSpacing: -0.05, lineHeight: 2, 'material-toneMapped': false }
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  const over = (e) => (e.stopPropagation(), setHovered(true))
  const out = () => setHovered(false)
  const click = () => {
    document.querySelector('.prompt input').value = children
    setResponseVisibility(true)
  }
  // Change the mouse cursor on hover
  useEffect(() => {
    if (hovered) document.body.style.cursor = 'pointer'
    return () => (document.body.style.cursor = 'auto')
  }, [hovered])
  // Tie component to the render-loop
  useFrame(({ camera }) => {
    // Make text face the camera
    ref.current.quaternion.copy(camera.quaternion)
    // Animate font color
    ref.current.material.color.lerp(color.set(hovered ? '#fa2720' : '#111'), 0.1)
  })
  return <Text ref={ref} onPointerOver={over} onPointerOut={out} onClick={click} {...props} {...fontProps} children={children} />
}

function Cloud({ count = 200, radius = 20, setResponseVisibility }) {
  console.log(arguments)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)) // ~137.5 degrees

  const words = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2 // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y) // radius at y

      const theta = goldenAngle * i // golden angle increment

      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY

      temp.push([new THREE.Vector3(x * radius, y * radius, z * radius), randomWord()])
    }
    return temp
  }, [count, radius])

  return words.map(([pos, word], index) => <Word key={index} position={pos} children={word} setResponseVisibility={setResponseVisibility} />)
}

const Response = ({ visibility, setVisibility, startCloudAnimation }) => {
  const responseClass = visibility ? 'response visible' : 'response'
  startCloudAnimation(visibility)
  const click = () => {
    setVisibility(false)
    startCloudAnimation(false)
  }
  return (
    <div className={responseClass}>
      <p>
        In the context of the document, the Affordable Care Act ensures that the offered benefits plans meet essential and affordable guidelines, providing financial relief and peace of mind to individuals and families during health crises or routine healthcare needs
      </p>
      <div class="pages">
        <div>Page 4</div>
        <div>Page 32</div>
      </div>
      <div onClick={click} class="close">
        X
      </div>
    </div>
  )
}

const animateCamera = (camera, mixer) => {
  const initialPosition = camera.position.clone()
  const targetPosition = new THREE.Vector3(0, 0, 35 + 20) // Panning the camera outwards the Cloud
  const duration = 2 // Animation duration in seconds

  const clip = new THREE.AnimationClip('CameraAnimation', duration, [
    new THREE.VectorKeyframeTrack(
      '.position',
      [0, duration],
      [initialPosition.x, initialPosition.y, initialPosition.z, targetPosition.x, targetPosition.y, targetPosition.z]
    )
  ])

  const action = mixer.clipAction(clip, camera)
  action.play()
}

const Prompt = ({ setResponseVisibility }) => {
  const click = () => {
    setResponseVisibility(true)
  }
  return (
    <div class="prompt">
      <input type="text" placeholder="What do you want to know..." />
      <div class="go-icon" onClick={click}>
        &rarr;
      </div>
    </div>
  )
}

const CameraAnimation = ({ animationStart }) => {
  // const [started, setStarted] = useState(false)
  // const vec = new THREE.Vector3()

  // useEffect(() => {
  //   setStarted(true)
  // })

  // useFrame((state) => {
  //   if (started) {
  //     state.camera.lookAt(0, 10, 0)
  //     //state.camera.position.lerp(vec.set(5, 0, -4), 0.008)

  //   }
  //   return null
  // })
  return null
}

export default function App() {
  const [responseVisibility, setResponseVisibility] = useState(false)
  const [animationStart, setAnimationStart] = useState(false)
  const [camPosition, setCamPosition] = useState(new THREE.Vector3())

  return (
    <div className="container">
      <img class="relayto-logo" src="https://cdn.prod.website-files.com/5d3dd13dcb7dfd0d23f46465/67dc063321bf30ae8452ddf8_Relayto%20Logo%20AI.webp" />
      <Prompt setResponseVisibility={setResponseVisibility} />
      <Canvas
        className={`cloud-container ${responseVisibility ? 'response-visible' : ''}`}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 35], fov: 90 }}
        onCreated={({ camera }) => {
          const mixer = new THREE.AnimationMixer(camera)
          animateCamera(camera, mixer)
        }}>
        <CameraAnimation animationStart={animationStart} />
        <fog attach="fog" args={['#d0d0d0', 15, 20]} />
        <Cloud count={80} radius={20} setResponseVisibility={setResponseVisibility} />
        <TrackballControls />
      </Canvas>
      <Response visibility={responseVisibility} startCloudAnimation={setAnimationStart} setVisibility={setResponseVisibility} />
    </div>
  )
}

