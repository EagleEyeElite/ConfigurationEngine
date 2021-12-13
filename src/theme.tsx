import {createTheme} from "@mui/material";

interface Colors {
  design: {
    darkRed: string
    internationalOrangeEngineering: string
    orangePantone: string
    lightGray: string
    background: string
  }
}

declare module '@mui/material/styles' {
  interface Theme extends Colors {}
  interface ThemeOptions extends Colors {}
}

// Corporate design palette
const Palette = {
  darkRed: '#8e0103',
  internationalOrangeEngineering: '#b81702',
  orangePantone: '#fa5e1f',
  lightGray: '#f6f6f6',
}

export const theme = createTheme({
  palette: {
    primary: {
      main: `${Palette.darkRed}`
    }
  },
  design: {
    ...Palette,
    background: `linear-gradient(20deg, ${Palette.orangePantone} 30%, ${Palette.internationalOrangeEngineering} 80%)`
  }
})
