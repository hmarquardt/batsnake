// @ts-check
import { Random } from '../core/Random.js';
const WORDS=['CENOTE','CALCITE','ROOST','MOON','CEIBA','MIST','WING','PIT','DRIFT','KARST','ECHO','COIL'];
export function createSeed(){const bytes=new Uint32Array(2);crypto.getRandomValues(bytes);return `${WORDS[bytes[0]%WORDS.length]}-${(bytes[1]%100000).toString().padStart(5,'0')}`;}
export function normalizeSeed(value){const clean=String(value||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,24);return clean.length>=3?clean:createSeed();}
export function randomForSeed(seed){return new Random(normalizeSeed(seed));}
