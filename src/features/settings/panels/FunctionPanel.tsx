import { observer } from 'mobx-react-lite'
import { useState } from 'react'

export interface FunctionSchema {
  [key: string]: {
    description: string
    params: {
      [key: string]: {
        description: string
        type: 'number' | 'string' | 'boolean' | 'bigint' | 'symbol' | 'undefined' | 'object'
        required: boolean
      }
    }
    requiredPhrases?: string[]
  }
}

const FunctionPanel = observer(() => {
  const [fnStore, setFnStore] = useState<{
    schema: FunctionSchema
    fns: {
      [key: string]: {
        fn: string
        icon?: string
        enabled?: boolean
        createdAt: number
      }
    }
  }>({
    schema: {},
    fns: {},
  })
  const [selectedFn, setSelectedFn] = useState<string | undefined>(undefined)

  const addFunction = () => {
    let i = 1
    let fn = `Function ${i}`
    while (fnStore.fns[fn]) {
      i++
      fn = `Function ${i}`
    }
    setFnStore({
      ...fnStore,
      fns: {
        ...fnStore.fns,
        [fn]: {
          fn,
          createdAt: Date.now(),
        },
      },
    })
    setSelectedFn(fn)
  }

  const delFunction = () => {
    if (typeof selectedFn === 'undefined') {
      return
    }
    const fns = { ...fnStore.fns }
    const index = Object.keys(fns).indexOf(selectedFn)
    delete fns[selectedFn]
    setSelectedFn(Object.keys(fns)[index - 1])
    setFnStore({
      ...fnStore,
      fns,
    })
  }

  return (
    <div className="p-2">
      {/* {Object.keys(fnStore.fns).length > 0 && <div className="label pb-1 text-sm">Edit</div>} */}
      <div className="flex flex-row items-center gap-2">
        <div>
          {Object.keys(fnStore.fns).length > 0 && typeof selectedFn !== 'undefined' && (
            <select
              style={{
                lineHeight: 2,
              }}
              className="select select-bordered select-sm flex items-center pb-1"
              onChange={e => {
                setSelectedFn(e.target.value)
              }}
              value={selectedFn}
            >
              {Object.keys(fnStore.fns).map(fn => (
                <option key={fn} value={fn}>
                  {fnStore.fns[fn].fn}
                </option>
              ))}
            </select>
          )}
        </div>
        <button onClick={addFunction} className="btn btn-outline btn-primary btn-sm">
          Add
        </button>
        <button onClick={delFunction} className="btn btn-outline btn-primary btn-sm">
          Delete
        </button>
      </div>
      {typeof selectedFn !== 'undefined' && (
        <div className="mt-2 flex h-full w-full flex-col overflow-y-scroll rounded-md">
          <table className="table table-zebra table-sm -mt-4 mb-4 border-separate border-spacing-y-2 pt-0">
            <thead className="sticky top-0 z-20 bg-base-300 text-base-content">
              <tr>
                <th>
                  <span className="flex w-fit select-none flex-row items-center">Name</span>
                </th>
                <th>
                  <span className="flex w-fit  select-none flex-row items-center ">Type</span>
                </th>
                <th>
                  <span className="flex w-fit  select-none flex-row items-center ">
                    Description
                  </span>
                </th>
                <th>
                  <span className="flex w-fit  select-none flex-row items-center ">Required</span>
                </th>
                <th>
                  <span className="flex w-fit  select-none flex-row items-center ">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="-mt-4 gap-2 px-2">
              <tr style={{ borderTopLeftRadius: 8 }}>
                <td>
                  <input className="block max-w-52 overflow-hidden bg-transparent font-semibold xl:max-w-80" />
                </td>
                <td>
                  <select
                    style={{
                      lineHeight: 1.25,
                    }}
                    className="select select-bordered select-sm"
                  >
                    <option>string</option>
                    <option>number</option>
                    <option>boolean</option>
                    <option>object</option>
                    <option>array</option>
                  </select>
                </td>
                <td>
                  <input className="block max-w-52 overflow-hidden bg-transparent font-semibold xl:max-w-80" />
                </td>
                <td>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs tooltip tooltip-bottom"
                    data-tip="Required?"
                  />
                </td>
                <td>
                  <button className="btn btn-primary btn-sm">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
})

export default FunctionPanel
