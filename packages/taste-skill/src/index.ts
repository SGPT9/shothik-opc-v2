#!/usr/bin/env node

import { program } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';

const TEMPLATES_DIR = path.join(__dirname, '../src/templates');

program
  .name('taste-skill')
  .description('A portable system to inject design taste into AI coding agents and reject frontend slop')
  .version('1.1.0');

program
  .command('init')
  .description('Initialize taste skills in your project')
  .action(async () => {
    console.log(chalk.blue.bold('\n✨ Welcome to Taste Skill ✨'));
    console.log(chalk.gray('Say goodbye to generic AI frontend slop.\n'));

    const response = await prompts([
      {
        type: 'select',
        name: 'skillType',
        message: 'Which taste profile do you want to install?',
        choices: [
          { title: 'All-Rounder Default', description: 'Strong foundations, generous whitespace, subtle motion', value: 'default.md' },
          { title: 'Soft Calm (Expensive)', description: 'Glassmorphism, soft shadows, low contrast borders', value: 'soft-calm.md' },
          { title: 'Cyber Dark (Deep Tech)', description: 'Obsidian surfaces, monospace telemetry, cyan glow accents', value: 'cyber-dark.md' },
          { title: 'Neo-Brutalism (Bold & Tactile)', description: 'Hard drop shadows, 2px borders, vibrant punchy contrast', value: 'neo-brutalist.md' },
          { title: 'Restrained Editorial', description: 'Strong typography, high contrast, monochrome', value: 'editorial.md' },
          { title: 'Strict GSAP', description: 'Aggressive layout shifts, scroll-driven animations', value: 'strict-gsap.md' },
          { title: 'Redesign Audit', description: 'Audits and upgrades existing generic code', value: 'redesign.md' },
          { title: 'No-Placeholder Output', description: 'Forces full component generation without placeholders', value: 'output.md' },
        ]
      },
      {
        type: 'select',
        name: 'targetSystem',
        message: 'Which AI agent system are you targeting?',
        choices: [
          { title: 'Cursor / Windsurf', description: 'Installs as .cursorrules / .windsurfrules', value: 'rules' },
          { title: 'Antigravity / Modular', description: 'Installs into .agents/skills/taste/', value: 'skill' },
          { title: 'Global Markdown', description: 'Installs as TASTE.md', value: 'markdown' }
        ]
      },
      {
        type: 'select',
        name: 'variance',
        message: 'Select Variance Level (How much deviation from standard UI allowed):',
        choices: [
          { title: 'Low (Safe)', value: 'Low' },
          { title: 'Medium (Balanced)', value: 'Medium' },
          { title: 'High (Creative)', value: 'High' }
        ]
      },
      {
        type: 'select',
        name: 'motion',
        message: 'Select Motion Intensity:',
        choices: [
          { title: 'None', value: 'None' },
          { title: 'Subtle', value: 'Subtle' },
          { title: 'Expressive', value: 'Expressive' }
        ]
      },
      {
        type: 'select',
        name: 'density',
        message: 'Select UI Density:',
        choices: [
          { title: 'Compact', value: 'Compact' },
          { title: 'Comfortable', value: 'Comfortable' },
          { title: 'Spacious', value: 'Spacious' }
        ]
      }
    ]);

    if (!response.skillType) {
      console.log(chalk.red('Installation cancelled.'));
      process.exit(0);
    }

    // Read the template
    const templatePath = path.join(TEMPLATES_DIR, response.skillType);
    if (!fs.existsSync(templatePath)) {
      console.error(chalk.red(`Template ${response.skillType} not found at ${templatePath}`));
      process.exit(1);
    }

    let content = fs.readFileSync(templatePath, 'utf-8');

    // Inject configuration dials
    const configHeader = `
> [!NOTE] 🎛️ **Taste Configuration Dials**
> - **Variance Level**: ${response.variance}
> - **Motion Intensity**: ${response.motion}
> - **UI Density**: ${response.density}
\n`;

    content = configHeader + content;

    // Determine target file
    let targetFile = '';
    let targetDir = process.cwd();

    if (response.targetSystem === 'rules') {
      targetFile = path.join(targetDir, '.cursorrules');
    } else if (response.targetSystem === 'skill') {
      targetDir = path.join(process.cwd(), '.agents', 'skills', 'taste');
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      targetFile = path.join(targetDir, 'SKILL.md');
      
      // Prepend skill frontmatter
      const frontmatter = `---
name: taste-skill
description: Forces AI to generate premium, anti-slop frontend UI based on the selected taste profile.
alwaysApply: true
---\n\n`;
      content = frontmatter + content;
      
    } else {
      targetFile = path.join(targetDir, 'TASTE.md');
    }

    // Write file
    fs.writeFileSync(targetFile, content);
    console.log(chalk.green(`\n✅ Successfully installed taste profile to ${targetFile}\n`));
    console.log(chalk.blue('Your AI agent will now generate better, non-generic UIs!'));
  });

program
  .command('prompt')
  .description('Generate copy-paste prompts for AI image generation (Midjourney / DALL-E / Gemini)')
  .action(async () => {
    console.log(chalk.magenta.bold('\n🎨 Image Generation Prompt Generator 🎨\n'));

    const response = await prompts([
      {
        type: 'select',
        name: 'promptType',
        message: 'Select prompt category:',
        choices: [
          { title: 'Brand Identity Kit', value: 'brand-kits.md' },
          { title: 'UI Reference Board', value: 'reference-boards.md' },
          { title: 'Component Design System Sheet', value: 'design-systems.md' }
        ]
      }
    ]);

    if (!response.promptType) {
      process.exit(0);
    }

    const filePath = path.join(TEMPLATES_DIR, 'image-generation', response.promptType);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(chalk.cyan('\n----------------------------------------\n'));
      console.log(content);
      console.log(chalk.cyan('----------------------------------------\n'));
      console.log(chalk.green('💡 Copy the prompt above into your image generation tool!'));
    } else {
      console.error(chalk.red('Prompt template not found.'));
    }
  });

program.parse();
