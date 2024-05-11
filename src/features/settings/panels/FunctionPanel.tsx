import { observer } from 'mobx-react-lite'
import { useKBar } from 'kbar'

import Github from '~/icons/Github'
import Search from '~/icons/Search'

import { SideBar } from '~/containers/SideBar'
import { settingStore } from '~/models/SettingStore'

// TODO: migrate all this into some extern. file
enum SortType {
  None = 'none',
  Name = 'name',
  Size = 'size',
  Updated = 'modifiedAt',
  Params = 'paramSize',
  Image = 'supportsImages',
}

const FunctionPanel = observer(() => {
  return (
    <div className="mt-2 flex h-full w-full flex-col overflow-y-scroll rounded-md">
      <table className="table table-zebra table-sm -mt-4 mb-4 border-separate border-spacing-y-2 pt-0">
        <thead className="sticky top-0 z-20 bg-base-300 text-base-content">
          <tr>
            <th>
              <span className="flex w-fit cursor-pointer select-none flex-row items-center underline">
                Name
              </span>
            </th>
            <th>
              <span className="flex w-fit cursor-pointer select-none flex-row items-center underline">
                Type
              </span>
            </th>
            <th>
              <span className="flex w-fit cursor-pointer select-none flex-row items-center underline">
                Description
              </span>
            </th>
            <th>
              <span className="flex w-fit cursor-pointer select-none flex-row items-center underline">
                Required
              </span>
            </th>
            <th>
              <span className="flex w-fit cursor-pointer select-none flex-row items-center underline">
                Actions
              </span>
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
  )
})

export default FunctionPanel
