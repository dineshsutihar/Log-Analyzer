import {atom} from 'recoil'; 

export const activeViewState = atom({
  key: 'activeViewState', 
  default: 'home', 
});