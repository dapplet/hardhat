import { PiletApi } from '@dapplet/shell';
import * as React from 'react';
import Assistant from './components/templates/Assistant';
import './main.css';

export function setup(app: PiletApi) {
  app.registerTile(
    () => {
      return <Assistant />;
    },
    {
      initialColumns: 1,
      initialRows: 1,
    }
  );
}
