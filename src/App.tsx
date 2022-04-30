import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Form from './features/form/Form';
import Map from './features/map/Map';
import styles from './App.module.scss';

function App() {
  return (
    <div className={styles.App}>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </div>
  );
}

export default App;
