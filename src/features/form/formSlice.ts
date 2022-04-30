import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface PositionState {
  origin: {
    lat: number;
    lng: number;
  };
  destination: {
    lat: number;
    lng: number;
  };
  history: Array<{
    date: string;
    origin: string;
    destination: string;
  }>;
  routeLength: number;
  status: 'idle' | 'loading' | 'failed' | 'finished';
}

interface Queries {
  queryOrigin: string;
  queryDestination: string;
}

const initialState: PositionState = {
  origin: {
    lat: 0,
    lng: 0
  },
  destination: {
    lat: 0,
    lng: 0
  },
  history: [],
  routeLength: 0,
  status: 'idle'
};

export const getPosAsync = createAsyncThunk(
  'form/getPositions',
  async ({ queryOrigin, queryDestination }: Queries) => {
    //get origin and destination lat/lng
    const responseOrigin = await fetch(
      `https://geocode.search.hereapi.com/v1/geocode?q=${queryOrigin}&apiKey=${process.env.REACT_APP_API}`
    );
    const responseDestination = await fetch(
      `https://geocode.search.hereapi.com/v1/geocode?q=${queryDestination}&apiKey=${process.env.REACT_APP_API}`
    );

    const dataOrigin = await responseOrigin.json();
    const dataDestination = await responseDestination.json();

    //calculating total route length
    const responseRouteLength = await fetch(
      `https://router.hereapi.com/v8/routes?transportMode=car&origin=${dataOrigin.items[0].position.lat},${dataOrigin.items[0].position.lng}&destination=${dataDestination.items[0].position.lat},${dataDestination.items[0].position.lng}&return=summary&apiKey=${process.env.REACT_APP_API}`
    );
    const dataRouteLength = await responseRouteLength.json();

    const obj = {
      origin: {
        lat: dataOrigin.items[0].position.lat,
        lng: dataOrigin.items[0].position.lng,
        queryOrigin
      },
      destination: {
        lat: dataDestination.items[0].position.lat,
        lng: dataDestination.items[0].position.lng,
        queryDestination
      },
      routeLength: +(
        dataRouteLength.routes[0].sections[0].summary.length / 1000
      ).toFixed(2)
    };
    return obj;
  }
);

export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    clearStatus: state => {
      state.status = 'idle';
    }
  },
  extraReducers: builder => {
    builder
      .addCase(getPosAsync.pending, state => {
        state.status = 'loading';
      })
      .addCase(getPosAsync.fulfilled, (state, action) => {
        state.status = 'finished';
        state.origin.lat = action.payload.origin.lat;
        state.origin.lng = action.payload.origin.lng;
        state.destination.lat = action.payload.destination.lat;
        state.destination.lng = action.payload.destination.lng;
        state.history.unshift({
          origin: action.payload.origin.queryOrigin,
          destination: action.payload.destination.queryDestination,
          date: new Date().toLocaleString()
        });
        state.routeLength = action.payload.routeLength;
      })
      .addCase(getPosAsync.rejected, state => {
        state.status = 'failed';
      });
  }
});

export const { clearStatus } = formSlice.actions;

export const selectForm = (state: RootState) => state.form;

export default formSlice.reducer;
