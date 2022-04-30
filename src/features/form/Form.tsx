import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Form.module.scss';

import { useAppSelector, useAppDispatch } from '../../app/hooks';

import { getPosAsync, selectForm } from './formSlice';

export default function Form() {
  const navigate = useNavigate();

  const formState = useAppSelector(selectForm);
  const dispatch = useAppDispatch();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const originHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrigin(e.target.value);
  };

  const destinationHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
  };

  const submitHandler = () => {
    dispatch(
      getPosAsync({ queryOrigin: origin, queryDestination: destination })
    );
  };

  //navigate to /map if finished
  useEffect(() => {
    if (formState.status === 'finished') {
      navigate('/map');
    }
  }, [formState.status, navigate]);

  return (
    <div className={styles.Form}>
      <h1>Maps App</h1>
      <input type="text" placeholder="ORIGIN" onChange={originHandler} />
      <input
        type="text"
        placeholder="DESTINATION"
        onChange={destinationHandler}
      />
      <button
        onClick={submitHandler}
        disabled={origin.length === 0 || destination.length === 0}
      >
        Find your way
      </button>

      {formState.status === 'loading' && (
        <div className={styles.Loader}>Loading...</div>
      )}

      <div className={styles.History}>
        {formState.history.length > 0 && (
          <h2 style={{ textAlign: 'center' }}>History:</h2>
        )}

        {/* search history */}
        {formState.history.length > 0 && (
          <ul>
            {formState.history.map((el, index) => (
              <li key={index} className={styles.HistoryEl}>
                {el.date}
                {':'}{' '}
                <p style={{ fontWeight: 'bold' }}>
                  {el.origin.toUpperCase()} {'->'}{' '}
                  {el.destination.toUpperCase()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
