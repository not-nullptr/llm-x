import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'

import { A1111HostInput } from '~/components/HostInput'
import NumberInput from '~/components/form/NumberInput'

import { settingStore } from '~/models/SettingStore'

const A1111EnabledCheckbox = observer(() => {
  useEffect(() => {
    if (settingStore.a1111Enabled) {
      settingStore.fetchA1111Models()
    }
  }, [settingStore.a1111Enabled])

  return (
    <label className="label w-fit cursor-pointer gap-2">
      <span className="label-text">Image Generation through AUTOMATIC1111:</span>

      <div className="join">
        {[true, false].map(isEnabled => (
          <button
            className={
              'btn join-item btn-sm mr-0 ' +
              (settingStore.a1111Enabled === isEnabled ? 'btn-active cursor-default ' : 'btn ')
            }
            onClick={() => settingStore.setA1111Enabled(isEnabled)}
            key={isEnabled ? 0 : 1}
          >
            <span>
              {isEnabled ? 'Enable' : 'Disable'}
              {settingStore.a1111Enabled === isEnabled ? 'd' : '?'}
            </span>
          </button>
        ))}
      </div>
    </label>
  )
})

const A1111SizeSelector = observer(() => {
  const { a1111Width: width, a1111Height: height, a1111Enabled } = settingStore

  const isSelected = (widthToCheck: number, heightToCheck: number) => {
    return widthToCheck === width && heightToCheck === height
  }

  return (
    <>
      <label className="label-text">Image Dimensions (width x height):</label>

      <div className="flex flex-row items-center gap-2">
        {[16, 128, 512, 1028].map(size => (
          <button
            className={'btn btn-outline btn-sm' + (isSelected(size, size) ? ' btn-primary ' : '')}
            onClick={() => settingStore.setA1111Size(size, size)}
            disabled={!a1111Enabled}
            key={size}
          >
            {size}x{size}
          </button>
        ))}

        <div className="ml-5 flex flex-row items-center justify-center gap-2 align-middle">
          <NumberInput
            type="number"
            min={16}
            max={99999}
            value={settingStore.a1111Width || 0}
            onChange={nextWidth => settingStore.setA1111Size(nextWidth, height)}
            placeholder="Width"
            disabled={!a1111Enabled}
          />
          x
          <NumberInput
            type="number"
            min={16}
            max={99999}
            value={settingStore.a1111Height || 0}
            onChange={nextHeight => settingStore.setA1111Size(width, nextHeight)}
            placeholder="Height"
            disabled={!a1111Enabled}
          />
        </div>
      </div>
    </>
  )
})

const A1111StepsSelector = observer(() => {
  const { a1111Steps: steps, a1111Enabled } = settingStore

  return (
    <>
      <label className="label-text">Steps:</label>

      <div className="flex flex-row items-center gap-2 align-bottom">
        {[1, 5, 10, 15, 20, 25, 50, 75, 150].map(count => (
          <button
            className={'btn btn-outline btn-sm' + (steps === count ? ' btn-primary ' : '')}
            onClick={() => settingStore.setA1111Steps(count)}
            disabled={!a1111Enabled}
            key={count}
          >
            {count}
          </button>
        ))}

        <div className="ml-5">
          <NumberInput
            type="number"
            min={0}
            max={99999}
            value={settingStore.a1111Steps}
            onChange={settingStore.setA1111Steps}
            placeholder="Steps"
            disabled={!a1111Enabled}
          />
        </div>
      </div>
    </>
  )
})

const A1111BatchSizeSelector = observer(() => {
  const { a1111BatchSize: batchSize, a1111Enabled } = settingStore

  return (
    <>
      <label className="label-text">Batch Size (image count):</label>

      <div className="flex flex-row items-center gap-2">
        {[1, 2, 3, 5, 7, 11].map(count => (
          <button
            className={
              'btn btn-outline btn-sm items-center' + (batchSize === count ? ' btn-primary ' : '')
            }
            onClick={() => settingStore.setA1111BatchSize(count)}
            disabled={!a1111Enabled}
            key={count}
          >
            {count}
          </button>
        ))}

        <div className="ml-5">
          <NumberInput
            type="number"
            className="max-w-[7ch]"
            min={0}
            max={99999}
            value={batchSize}
            onChange={settingStore.setA1111BatchSize}
            placeholder="Size"
            disabled={!a1111Enabled}
          />
        </div>
      </div>
    </>
  )
})

const A1111GeneralPanel = observer(() => {
  return (
    <div className="flex w-full flex-col gap-4">
      <A1111EnabledCheckbox />
      <A1111HostInput />

      <A1111SizeSelector />
      <A1111StepsSelector />
      <A1111BatchSizeSelector />
    </div>
  )
})

export default A1111GeneralPanel
