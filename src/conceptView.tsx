import * as React from 'react'
import {Checkbox, FormControlLabel, styled, Tooltip, tooltipClasses, TooltipProps} from "@mui/material"
import {TreeItem, treeItemClasses, TreeItemProps, TreeView} from "@mui/lab"
import {ChevronRight, ExpandMore} from '@mui/icons-material'
import {Node} from "./generator";


type handleChange = (arg0: number[], arg1: boolean) => void

type StyledTreeItemProps = TreeItemProps & {
  item: Node
  handleChange: handleChange
  route: number[]
}

const StyledTooltip = styled(({className, ...props}: TooltipProps) =>
  <Tooltip {...props} children={props.children} classes={{popper: className}} disableInteractive disableFocusListener/>
)(({theme}) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    color: theme.palette.text.secondary,
    boxShadow: theme.shadows[5],
    backgroundColor: theme.design.lightGray,
  }
}))

/**
 * Displays concept selector as selectable checkboxes or expandable menus.
 * Also stores configuration and additional conditions.
 */
function StyledTreeItem(props: StyledTreeItemProps) {
  const {
    item,
    handleChange,
    route,
    ...other
  } = props
  return (
    <StyledTooltip title={item.description || ""}>
      <TreeItem
        sx={{
          [`& .${treeItemClasses.iconContainer}`]: {px: 1},
          [`& .${treeItemClasses.content}`]: {
            px: 0,
            borderRadius: (theme) => theme.spacing(2),
          },
          [`& .${treeItemClasses.group}`]: {mx: 2}
        }}
        label={
          <FormControlLabel
            control={
              <Checkbox
                checked={item.checked}
                onChange={() => Promise.resolve().then(() => handleChange(route, true))}
                onClick={e => e.stopPropagation()}
              />
            }
            label={item.title}
            onClick={e => e.stopPropagation()}
            sx={{py:0.5}}
          />
        }
        onClick={() => handleChange(route, false)}
        {...other}
      />
    </StyledTooltip>
  )
}

export type ConceptNavigatorProps = {
  stateTree: Node[]
  handleChange: handleChange
  selected: string
  expanded: Set<string>
}

/**
 * Component reflects selected configuration.
 */
export default class ConceptNavigator extends React.Component<ConceptNavigatorProps> {
  /**
   * Renders a key from a given route.
   */
  static getKey(route: number[]): string {
    return route.map(i => i.toString()).join('-')
  }

  renderSubTree(node: Node[], route: number[]): JSX.Element {
    if (node === undefined || route.length >= 5) {
      console.error("Tree is nested too deeply.", node)
      return <></>
    }
    let treeEntries: JSX.Element[] = []
    node.forEach((item, index) => {
      let newRoute = [...route, index]
      let children = null
      if (item.children !== undefined) {
        children = this.renderSubTree(item.children, newRoute)
      }
      let key = ConceptNavigator.getKey(newRoute)
      treeEntries.push(
        <StyledTreeItem
          key={key}
          nodeId={key}
          item={item}
          route={newRoute}
          handleChange={this.props.handleChange}
          children={children}
        />
      )
    })
    return <>{treeEntries}</>
  }

  render() {
    return <>
      <TreeView
        aria-label="Concept selector"
        defaultCollapseIcon={<ExpandMore/>}
        defaultExpandIcon={<ChevronRight/>}
        sx={{minHeight: 400, overflowY: 'auto', overflowX: 'visible'}}
        expanded={[...this.props.expanded]}
        selected={this.props.selected}
      >
        {this.renderSubTree(this.props.stateTree, [])}
      </TreeView>
    </>
  }
}
