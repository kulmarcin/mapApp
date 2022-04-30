import { store } from '../../app/store';
import { getPosAsync, clearError, clearStatus } from './formSlice';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

const origin = 'warsaw';
const destination = 'cracow';

const getResponseOrigin = {
  items: [
    {
      position: {
        lat: 52.2356,
        lng: 21.01037
      },
      queryOrigin: 'warsaw'
    }
  ]
};

const getResponseDestination = {
  items: [
    {
      position: {
        lat: 50.06045,
        lng: 19.93242
      },
      queryOrigin: 'cracow'
    }
  ]
};

const getResponseRoute = {
  routes: [
    {
      sections: [
        {
          summary: {
            length: 291920
          }
        }
      ]
    }
  ]
};

const mockFn = async () => {
  fetchMock
    .once(JSON.stringify(getResponseOrigin))
    .once(JSON.stringify(getResponseDestination))
    .once(JSON.stringify(getResponseRoute));
  return await store.dispatch(
    getPosAsync({ queryOrigin: origin, queryDestination: destination })
  );
};

describe('formSlice', () => {
  test('State should have proper lat and lng after fetch', async () => {
    await mockFn();

    expect(store.getState().form.origin.lat).toBe(52.2356);
    expect(store.getState().form.origin.lng).toBe(21.01037);
    expect(store.getState().form.destination.lat).toBe(50.06045);
    expect(store.getState().form.destination.lng).toBe(19.93242);
  });

  test('State should have proper route length after fetch', async () => {
    await mockFn();

    expect(store.getState().form.routeLength).toBe(291.92);
  });

  test('State should have proper queries after fetch', async () => {
    const result: any = await mockFn();

    expect(result.payload.origin.queryOrigin).toBe('warsaw');
    expect(result.payload.destination.queryDestination).toBe('cracow');
  });

  test('Search should be added to history', async () => {
    await mockFn();

    expect(store.getState().form.history.length).toBe(4); // 4 because there are 4 tests
  });

  test('Proper state status after success fetch', () => {
    expect(store.getState().form.status).toBe('finished');
  });

  test('Proper state status after failed fetch', async () => {
    fetchMock
      .mockRejectedValueOnce(
        new Error("Cannot read properties of undefined (reading 'position')")
      )
      .mockRejectedValueOnce(
        new Error("Cannot read properties of undefined (reading 'position')")
      )
      .mockRejectedValueOnce(
        new Error("Cannot read properties of undefined (reading 'position')")
      );

    await store.dispatch(
      getPosAsync({ queryOrigin: origin, queryDestination: destination })
    );

    expect(store.getState().form.status).toBe('failed');
  });

  test('Proper error -> reading position', async () => {
    expect(store.getState().form.error).toBe(
      'Origin or Destination Not Found!'
    );
  });

  test('Proper error -> reading sections', async () => {
    fetchMock.resetMocks();
    fetchMock
      .mockRejectedValueOnce(
        new Error("Cannot read properties of undefined (reading 'sections')")
      )
      .mockRejectedValueOnce(
        new Error("Cannot read properties of undefined (reading 'sections')")
      )
      .mockRejectedValueOnce(
        new Error("Cannot read properties of undefined (reading 'sections')")
      );

    await store.dispatch(
      getPosAsync({ queryOrigin: origin, queryDestination: destination })
    );

    expect(store.getState().form.error).toBe('Could Not Get There by Car!');
  });

  test('clearStatus reducer', async () => {
    await store.dispatch(clearStatus());

    expect(store.getState().form.status).toBe('idle');
  });

  test('clearError reducer', async () => {
    await store.dispatch(clearError());

    expect(store.getState().form.error).toBe(null);
  });
});
