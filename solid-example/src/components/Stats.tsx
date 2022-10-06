import { addEffect, addAfterEffect } from 'solid-three'
import StatsImpl from 'stats.js'
import { Props } from '../root'

export function Stats({ showPanel = 2, className, parent }: Props): null {
  const getStats = createMemo(() => new StatsImpl())
  createEffect(() => {
    let stats = getStats()
    if (stats) {
      const node = (parent && parent.current) || document.body
      stats.showPanel(showPanel)
      node?.appendChild(stats.dom)
      if (className) stats.dom.classList.add(...className.split(' ').filter((cls) => cls))
      const begin = addEffect(() => stats.begin())
      const end = addAfterEffect(() => stats.end())
      return () => {
        node?.removeChild(stats.dom)
        begin()
        end()
      }
    }
  })

  return null
}
