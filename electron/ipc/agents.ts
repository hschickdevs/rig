import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

interface AgentDef {
  id: string;
  name: string;
  command: string;
  args: string[];
  resume_args: string[];
  skip_permissions_args: string[];
  description: string;
  available?: boolean;
  /** When true, the initial prompt is appended as the trailing argv element at spawn,
   *  and the agent's CLI opens an interactive TUI with that prompt as the first message. */
  supports_initial_prompt_argv?: boolean;
}

const DEFAULT_AGENTS: AgentDef[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    command: 'claude',
    args: [],
    resume_args: ['--continue'],
    skip_permissions_args: ['--dangerously-skip-permissions'],
    description: "Anthropic's Claude Code CLI agent",
    supports_initial_prompt_argv: true,
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    command: 'codex',
    args: [],
    resume_args: ['resume', '--last'],
    skip_permissions_args: ['--full-auto'],
    description: "OpenAI's Codex CLI agent",
    supports_initial_prompt_argv: true,
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    command: 'gemini',
    args: [],
    resume_args: ['--resume', 'latest'],
    skip_permissions_args: ['--yolo'],
    description: "Google's Gemini CLI agent",
    supports_initial_prompt_argv: true,
  },
];

async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    await execFileAsync('which', [command], { encoding: 'utf8', timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

// TTL cache to avoid repeated `which` calls
let cachedAgents: AgentDef[] | null = null;
let cacheTime = 0;
const AGENT_CACHE_TTL = 30_000;

export async function listAgents(): Promise<AgentDef[]> {
  const now = Date.now();
  if (cachedAgents && now - cacheTime < AGENT_CACHE_TTL) {
    return cachedAgents;
  }

  cachedAgents = await Promise.all(
    DEFAULT_AGENTS.map(async (agent) => ({
      ...agent,
      available: await isCommandAvailable(agent.command),
    })),
  );
  cacheTime = now;
  return cachedAgents;
}
