import * as React from 'react'
import {Box, Container, Grid, Paper, Typography} from '@mui/material'
import {CopyButton} from './copyButton'
import ConceptNavigator from './conceptView'
import tree from './asset/tree.json'
import text from './asset/text.json'

type OwnGridProps = {
  title?: string
}

/**
 * Grid Item stores a title as well as a custom content.
 * They are fully responsive and match the layout.
 */
function GridItem(props: React.PropsWithChildren<OwnGridProps>) {
  return <Grid item xs={12} md={6} sx={{display: 'flex', flexDirection: "column"}}>
    <Container maxWidth={'sm'} disableGutters sx={{display: 'flex', flexDirection: "column", flexGrow: 1}}>
      <Paper sx={{
        ...(theme: { typography: { body2: any } }) => ({
          ...theme.typography.body2,
        }),
        color: (theme) => theme.palette.text.secondary,
        p: 2,
        flexGrow: 1,
        display: 'flex',
        flexDirection: "column"
      }}
      >
        <Typography variant="h5" sx={{mb: "0.3em"}}>{props.title}</Typography>
        {props.children}
      </Paper>
    </Container>
  </Grid>
}

export type Node = {
  id: string
  title: string
  checked: boolean
  require?: string[]
  description?: string
  exclusiveChildren?: boolean
  children?: Node[]
}

type State = {
  textList: string[]
  tree: Node[]
  selected: string
  expanded: Set<string>
}

/**
 * Renders whole page. Title, pages, content.
 * Deals with updating checkbox states and text output also.
 */
export default class Generator extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props)
    this.state = {
      textList: [],
      tree: tree.tree,
      selected: '',
      expanded: new Set(['0', '1', '1-0'])
    }
  }

  /**
   * Computes the tree state based on a click. These rules apply:
   * - A concept can be enabled or disabled
   * - When a child concept is enabled, all its parents are also enabled
   * - When a group is exclusive, it can only have one concept enabled at a time, the others are disabled
   */
  computeTree(route: number[]): [Node[], Node] | null {
    let tree = JSON.parse(JSON.stringify(this.state.tree))
    if(route.length === 1) {
      let child = tree[route[0]]
      child.checked = !child.checked
      return [tree, child]
    }
    let parents: Node[] = []
    let i = tree
    for (let node of route.slice(0, -1)) {
      parents.push(i[node])
      i = i[node].children || []
    }
    let parentNode = parents[parents.length -1]
    if (parentNode === undefined || parentNode.children === undefined) {
      console.error("Given route is invalid: ", route)
      return null
    }
    let child = parentNode.children[route[route.length -1] || 0]
    // enable all parents too, when child concept is enabled
    if (!child.checked) {
      parents.map((node) => node.checked = true)
    }
    // disable all other children for exclusive children
    if (parentNode.exclusiveChildren) {
      parentNode.children.map(
        (node, index) =>
          node.checked = index !== route[route.length -1] ? false : node.checked
      )
    }
    child.checked = !child.checked
    return [tree, child]
  }

  /**
   * Sets the state of the config tree.
   * This includes the selected item, the branch expansion, and selected config.
   */
  handleChange(route: number[], clickedForm: boolean): void {
    let [tree, child] = this.computeTree(route) || [null, null]
    if(tree === null || child === null) {
      return
    }
    let id = ConceptNavigator.getKey(route)
    let expanded = new Set(this.state.expanded)
    if(clickedForm ? child.checked : !expanded.has(id)) {
      expanded.add(id)
    } else {
      expanded.delete(id)
    }
    if(clickedForm) {
      this.setState({tree: tree})
    }
    this.setState({
      expanded: expanded,
      selected: id
    })
  }

  /**
   * Breadth first traversal tree search.
   */
  getSelection(node: Node[]): Set<string> {
    let set = new Set<string>()
    for (let i of node) {
      if (!i.checked) {
        continue
      }
      for (let n of (i.require || [])) {
        set.add(n)
      }
      let children = this.getSelection(i.children || [])
      set = new Set<string>([...set, ...(children || [])])
    }
    return set
  }

  /**
   * Displays text based on selected concept configuration.
   */
  renderText() {
    let output: JSX.Element[] = []
    let copyText = ""
    for (let i of [...this.getSelection(this.state.tree)]) {
      let element = text[i as (keyof typeof text)]
      if (element === undefined) {
        console.error("linked text was not found: " + i)
        continue
      }
      output.push(
        <div key={i}>
          <Typography sx={{ fontWeight: 'bold' }}>
            {element.title}
          </Typography>
          <Typography sx={{whiteSpace: 'pre-line'}}>
            {element.text + "\n\n"}
          </Typography>
        </div>
      )
      copyText += element.title + "\n" + element.text + "\n\n"
    }
    return <>
      <Box sx={{flexGrow: 1, minHeight: 100}}>
        {output}
      </Box>
      <CopyButton text={copyText}/>
    </>
  }

  /**
   * Renders concept configuration tree and shows the text output.
   */
  render() {
    return <>
      <Box sx={{p: 6, background: theme => theme.design.background}}>
        <Typography variant="h2" align="center" color="white">
          Configuration Engine
        </Typography>
      </Box>
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        background: theme => theme.design.lightGray
      }}>
        <Container disableGutters maxWidth={'lg'}>
          <Grid container spacing={4} sx={{p: 4}}>
            <GridItem title="Configuration:">
              <ConceptNavigator
                stateTree={this.state.tree}
                selected={this.state.selected}
                handleChange={this.handleChange.bind(this)}
                expanded={this.state.expanded}
              />
            </GridItem>
            <GridItem title="Text output:">
              {this.renderText()}
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </>
  }
}
