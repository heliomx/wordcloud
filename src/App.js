import * as THREE from 'three'
import { useRef, useState, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, TrackballControls } from '@react-three/drei'
import { Tween, Easing } from '@tweenjs/tween.js'
//import randomWord from 'random-words'
const terms = [
  'ESG Report',
  'Apple',
  'Interviews',
  'Satisfaction surveys',
  'Supplier employees',
  'Governance',
  'Communities',
  'Suppliers',
  'Customers',
  'People',
  'Environment',
  'Siri',
  'Report',
  'Product longevity',
  'Repair or replacement',
  'Design',
  'Protocols',
  'CSD program',
  'Chemicals and applications',
  'Safer work environment',
  'Assessment and management',
  'Data collection',
  'Product designs',
  'Manufacturing processes',
  'Recycling and reuse',
  'Requirements for suppliers',
  'Environmental Testing Lab',
  'Safety evaluation',
  'Shout Mouse Press',
  'Latin American Youth Center',
  "Bilingual children's books",
  'Cultural celebration',
  'Grief',
  'Family',
  'Friendship'
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
  const color = new THREE.Color()
  const fontProps = {
    font: '/Inter-Bold.woff',
    fontSize: 0.8,
    letterSpacing: -0.05,
    lineHeight: 2,
    'material-toneMapped': false
  }
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
  const close = () => {
    setVisibility(false)
  }
  return (
    <div className={responseClass}>
      <p>
        Apple emphasizes its commitment to combat climate change and its impacts. They have set ambitious goals to achieve carbon neutrality for all their
        products by 2030 and have already made significant progress in reducing carbon emissions. Apple is actively advocating for strong climate change
        policies and engaging with others to support their efforts. They believe in taking urgent action to protect our planet's limited resources and be a
        leader in the fight against climate change
      </p>
      <div className="pages">
        <div>Page 4</div>
        <div>Page 32</div>
      </div>
      <div onClick={close} className="close">
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
    <div className="prompt">
      <div className="title">Document Explorer</div>
      <input type="text" placeholder="What do you want to know..." />
      <div className="go-icon" onClick={click}>
        &rarr;
      </div>
    </div>
  )
}

const InitialCameraAnimation = ({ onAnimationComplete }) => {
  const { camera } = useThree()
  const hasAnimated = useRef(false)
  const tween = useRef()

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true
      const initialPosition = camera.position.clone()

      // Calculate a slight circular movement around the sphere
      const angle = Math.PI / 18 // 10 degrees
      const radius = 5 // radius of the circular movement
      const circularTarget = new THREE.Vector3(initialPosition.x + radius * Math.cos(angle), initialPosition.y + radius * Math.sin(angle), 35)

      setTimeout(() => {
        tween.current = new Tween(camera.position)
          .to(circularTarget, 2000) // 2000 milliseconds = 2 seconds
          .easing(Easing.Quadratic.Out) // Use an easing function for a more natural motion
          .onUpdate(() => {
            camera.updateProjectionMatrix() // Update the camera's matrix
            // Rotate the camera slightly around the target
            camera.lookAt(new THREE.Vector3(0, 0, 0))
          })
          .onComplete(() => {
            console.log('Animation finished')
            onAnimationComplete()
          })
          .start() // Start the tween
      }, 2000)
    }
  }, [camera, onAnimationComplete])

  useFrame(() => {
    if (tween.current) {
      tween.current.update() // Update the tween on each frame
    }
  })

  return null
}

const ConstantCameraOrbit = ({ radius = 30, speed = 0.5, startDelay = 2, stopAnimation }) => {
  const { camera } = useThree()
  const startTime = useRef(null)
  const initialPosition = useRef(camera.position.clone())
  const finalPosition = useRef()
  const [isAnimating, setIsAnimating] = useState(!stopAnimation)
  finalPosition.current = new THREE.Vector3(camera.position.x, camera.position.y, 30)
  // Easing function - ease out cubic
  const easeOutCubic = (t) => --t * t * t + 1

  useFrame(({ clock }) => {
    if (stopAnimation) {
      // If stopAnimation is true, ease the camera movement towards z = 30
      camera.position.lerpVectors(camera.position, finalPosition, 0.02)
      if (camera.position.z >= 29.9) {
        // Once the camera is close enough to the final position, stop all animations
        camera.position.z = 30 // Snap to the exact final position if it's close enough
        setIsAnimating(false) // This will stop the orbit animation
        stopAnimation = false
      }
      camera.lookAt(new THREE.Vector3(0, 0, 0))
    } else if (isAnimating) {
      if (startTime.current === null) {
        startTime.current = clock.getElapsedTime()
      }

      const elapsedTime = clock.getElapsedTime() - startTime.current
      let t = elapsedTime / startDelay
      t = easeOutCubic(Math.min(t, 1)) // Apply easing function and clamp t to a max of 1

      // Calculate the position on the orbit path for this frame
      const orbitAngle = speed * elapsedTime * t // Apply easing to the speed
      const orbitPosition = new THREE.Vector3(radius * Math.sin(orbitAngle), initialPosition.current.y, radius * Math.cos(orbitAngle))

      // Interpolate between the current position and the orbit position
      camera.position.lerpVectors(initialPosition.current, orbitPosition, t)

      // If the start delay has passed, update the initial position to be on the orbit path
      if (elapsedTime >= startDelay) {
        initialPosition.current.copy(orbitPosition)
      }

      camera.lookAt(new THREE.Vector3(0, 0, 0))
    }
  })

  return null
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
  const [runInitialAnimation, setRunInitialAnimation] = useState(true)
  const [stopAnimation, setStopAnimation] = useState(true)

  function setStartAnimation(value) {
    setStopAnimation(!value)
  }

  return (
    <div className="container">
      <Prompt setResponseVisibility={setResponseVisibility} />
      <Canvas className={`cloud-container ${responseVisibility ? 'response-visible' : ''}`} dpr={[1, 2]} camera={{ position: [0, 0, 0], fov: 90 }}>
        {/* {runInitialAnimation && <InitialCameraAnimation onAnimationComplete={() => setRunInitialAnimation(false)} />} */}
        <ConstantCameraOrbit radius={25} speed={0.01} startDelay={2} stopAnimation={stopAnimation} />
        <fog attach="fog" args={['#d0d0d0', 15, 20]} />
        <Cloud count={80} radius={20} setResponseVisibility={setResponseVisibility} />
        <TrackballControls />
      </Canvas>
      <Response visibility={responseVisibility} setVisibility={setResponseVisibility} startCloudAnimation={setStartAnimation} />
    </div>
  )
}
