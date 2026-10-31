import { mount } from 'svelte';
import './theme/tokens.css';
import './theme/base.css';
import App from './App.svelte';

const target = document.getElementById('app');
if (target) mount(App, { target });
