import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import navigationReducer from './navigationSlice';
import operationsReducer from './operationsSlice';
import marketingReducer from './marketingSlice';
import governanceReducer from './governanceSlice';
import strategyReducer from './strategySlice';
import financeReducer from './financeSlice';
import hrReducer from './hrSlice';
import securityReducer from './securitySlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    navigation: navigationReducer,
    operations: operationsReducer,
    marketing: marketingReducer,
    governance: governanceReducer,
    strategy: strategyReducer,
    finance: financeReducer,
    hr: hrReducer,
    security: securityReducer,
    auth: authReducer,
  },
});

export default store;
