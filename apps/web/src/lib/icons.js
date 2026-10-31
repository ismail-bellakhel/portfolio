/*
  Icons referenced by NAME from src/data/content.js are resolved through this
  map. Importing the whole lucide namespace (`import * as Icons`) defeats
  tree-shaking and pulls all ~6,800 icons into the bundle, so every dynamic
  lookup goes through this explicit registry instead.

  Adding a new `icon` or `fallback` string to content.js means adding it here.
*/
import {
  BarChart3,
  Bot,
  Box,
  Building2,
  Car,
  Code2,
  Database,
  Dumbbell,
  FlaskConical,
  GraduationCap,
  Layers,
  Layout,
  LineChart,
  MousePointerClick,
  Newspaper,
  RadioTower,
  Search,
  Settings,
  Sparkles,
  Target,
  Users,
  Workflow,
} from 'lucide-react';

const ICONS = {
  BarChart3,
  Bot,
  Box,
  Building2,
  Car,
  Code2,
  Database,
  Dumbbell,
  FlaskConical,
  GraduationCap,
  Layers,
  Layout,
  LineChart,
  MousePointerClick,
  Newspaper,
  RadioTower,
  Search,
  Settings,
  Sparkles,
  Target,
  Users,
  Workflow,
};

/** Resolve an icon by name, falling back to a neutral glyph. */
export function icon(name, fallback = Layers) {
  return ICONS[name] || fallback;
}
