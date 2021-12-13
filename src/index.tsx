import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserHistoryOptions, createBrowserHistory} from 'history';
import {Box, Container, ThemeProvider} from "@mui/material"
import {theme} from "./theme";
import Generator from './generator';


export const history = createBrowserHistory({
  basename: process.env.PUBLIC_URL
} as BrowserHistoryOptions);

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <Box sx={{display: 'flex', flexFlow: 'column', height: '100vh'}}>
        <Container disableGutters maxWidth={false} sx={{
          minWidth: 360,
          maxWidth: 2000,
          boxShadow: 5,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Generator/>
        </Container>
      </Box>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
