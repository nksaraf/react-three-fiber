import { ParentContext } from '~/trinity/ParentContext'

export function Primitive(props) {
  const parent = useContext(ParentContext)

  if (typeof props.ref === 'function') {
    props.ref(parent)
  }

  createRenderEffect(() => {
    console.log(parent())
    if (props.object && parent()) {
      let obj = props.object
      parent().__r3f.objects.push(obj)
      onCleanup(() => {
        parent().__r3f.objects.splice(parent().__r3f.objects.indexOf(obj), 1)
      })
    }
  })

  return <ParentContext.Provider value={() => props.object}>{props.children}</ParentContext.Provider>
}
