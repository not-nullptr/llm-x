import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface FunctionSchema {
  [key: string]: {
    description: string
    params: {
      [key: string]: {
        description: string
        type: 'number' | 'string' | 'boolean' | 'bigint' | 'symbol' | 'undefined' | 'object'
        required: boolean
        createdAt: number
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
  const nameRef = useRef<HTMLInputElement>(null)

  const addFunction = async () => {
    let i = 1
    let fn = `Function ${i}`
    while (fnStore.fns[fn]) {
      i++
      fn = `Function ${i}`
    }
    await setFnStore({
      ...fnStore,
      schema: {
        ...fnStore.schema,
        [fn]: {
          description: 'A sample function',
          params: {
            param1: {
              description: 'A sample parameter',
              type: 'string',
              required: false,
              createdAt: Date.now(),
            },
          },
        },
      },
      fns: {
        ...fnStore.fns,
        [fn]: {
          fn: `// define your tool's code here\nconst run: Tool = ({}) => {\n    console.log("ran!");\n    return "";\n}\n\n// expose our tool to the LLM\nrun;`,
          createdAt: Date.now(),
        },
      },
    })
    await setSelectedFn(fn)
    if (nameRef.current) {
      nameRef.current.value = fn
    }
  }

  const delFunction = () => {
    if (typeof selectedFn === 'undefined') {
      return
    }
    const fns = { ...fnStore.fns }
    const index = Object.keys(fns).indexOf(selectedFn)
    delete fns[selectedFn]
    setSelectedFn(Object.keys(fns)[index - 1] || Object.keys(fns)[index] || undefined)
    if (nameRef.current) {
      nameRef.current.value = Object.keys(fns)[index - 1] || Object.keys(fns)[index] || ''
    }
    setFnStore({
      ...fnStore,
      fns,
    })
  }

  const deleteParam = (name: string) => {
    if (typeof selectedFn === 'undefined') {
      return
    }
    const params = { ...fnStore.schema[selectedFn].params }
    delete params[name]
    setFnStore({
      ...fnStore,
      schema: {
        ...fnStore.schema,
        [selectedFn]: {
          ...fnStore.schema[selectedFn],
          params,
        },
      },
    })
  }

  const addParam = () => {
    if (typeof selectedFn === 'undefined') {
      return
    }
    let i = 1
    let paramName = `param${i}`
    while (fnStore.schema[selectedFn]?.params[paramName]) {
      i++
      paramName = `param${i}`
    }
    setFnStore({
      ...fnStore,
      schema: {
        ...fnStore.schema,
        [selectedFn]: {
          ...fnStore.schema[selectedFn],
          params: {
            ...fnStore.schema[selectedFn].params,
            [paramName]: {
              description: 'A sample parameter',
              type: 'string',
              required: false,
              createdAt: Date.now(),
            },
          },
        },
      },
    })
  }

  const updateSchema = (schemaItem: Partial<FunctionSchema['']>) => {
    if (typeof selectedFn === 'undefined') {
      return
    }
    setFnStore({
      ...fnStore,
      schema: {
        ...fnStore.schema,
        [selectedFn]: {
          ...fnStore.schema[selectedFn],
          ...schemaItem,
        },
      },
    })
  }

  return (
    <div className="h-full w-full p-2">
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
                if (nameRef.current) {
                  nameRef.current.value = e.target.value
                }
              }}
              value={selectedFn}
            >
              {Object.entries(fnStore.fns)
                .sort((a, b) => a[1].createdAt - b[1].createdAt)
                .map(([fn]) => (
                  <option key={fn} value={fn}>
                    {fn}
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
        <div>
          <form className="form-control mb-6 mt-4">
            <div className="label pb-1 pt-0">
              <span className="label-text flex flex-row items-center gap-2 text-sm">
                Function name
              </span>
            </div>
            <div className="flex flex-row items-center gap-2">
              <input
                type="text"
                id="host"
                className="input input-bordered w-full focus:outline-none"
                placeholder={selectedFn}
                defaultValue={selectedFn}
                ref={nameRef}
                onChange={e => {
                  // if it already exists, don't do anything
                  if (fnStore.fns[e.target.value]) {
                    return
                  }
                  const store = { ...fnStore }
                  store.fns[e.target.value] = store.fns[selectedFn]
                  delete store.fns[selectedFn]
                  store.schema[e.target.value] = store.schema[selectedFn]
                  delete store.schema[selectedFn]
                  setSelectedFn(e.target.value)
                  setFnStore(store)
                }}
              />
            </div>
          </form>
          <form className="form-control mb-6 mt-4">
            <div className="label pb-1 pt-0">
              <span className="label-text flex flex-row items-center gap-2 text-sm">
                Description
              </span>
            </div>
            <div className="flex flex-row items-center gap-2">
              <input
                type="text"
                id="host"
                className="input input-bordered w-full focus:outline-none"
                placeholder={fnStore.schema?.[selectedFn]?.description}
                defaultValue={fnStore.schema?.[selectedFn]?.description}
                key={selectedFn}
              />
            </div>
          </form>
          <div className="mt-2 flex h-full w-full flex-col overflow-y-scroll rounded-md">
            <table className="table table-zebra table-sm -mt-4 mb-4 w-full border-separate border-spacing-y-2 pt-0">
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
                {Object.entries(fnStore.schema?.[selectedFn]?.params || {})
                  .sort((a, b) => a[1].createdAt - b[1].createdAt)
                  .map(([param, val]) => (
                    <tr style={{ borderTopLeftRadius: 8 }} key={param}>
                      <td>
                        <input
                          defaultValue={param}
                          className="block max-w-52 overflow-hidden bg-transparent font-semibold xl:max-w-80"
                        />
                      </td>
                      <td>
                        <select
                          style={{
                            lineHeight: 1.25,
                          }}
                          className="select select-bordered select-sm"
                          defaultValue={val.type}
                        >
                          <option>string</option>
                          <option>number</option>
                          <option>boolean</option>
                          <option>object</option>
                          <option>array</option>
                        </select>
                      </td>
                      <td>
                        <input
                          defaultValue={val.description}
                          className="block max-w-52 overflow-hidden bg-transparent font-semibold xl:max-w-80"
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs tooltip tooltip-bottom"
                          data-tip="Required?"
                          defaultChecked={val.required}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => deleteParam(param)}
                          className="btn btn-primary btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div>
              <button onClick={addParam} className="btn btn-primary btn-sm">
                Add a new param
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default FunctionPanel
