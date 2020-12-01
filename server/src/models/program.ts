import { IProgram } from "../../../src/models/program";
import { CollectionUtils } from "../../../src/utils/collection";
import { CloudflareWorkerKV } from "types-cloudflare-worker";

declare let kv_liftosaur_programs: CloudflareWorkerKV;
declare let kv_liftosaur_programs_prod: CloudflareWorkerKV;

interface IProgramPayload {
  program: IProgram;
  id: string;
  timestamp: number;
  version: number;
}

export namespace ProgramModel {
  export async function getAll(): Promise<IProgramPayload[]> {
    const keys = (await kv_liftosaur_programs.list()).keys;
    const groups = CollectionUtils.inGroupsOf(100, keys);
    let programs: IProgramPayload[] = [];
    for (const group of groups) {
      programs = programs.concat(await Promise.all(group.map((key) => kv_liftosaur_programs.get(key.name, "json"))));
    }
    return programs;
  }

  export async function storeAll(programs: IProgram[], version: number): Promise<void> {
    const groups = CollectionUtils.inGroupsOf(100, programs);
    for (const group of groups) {
      await Promise.all(
        group.map(async (program) => {
          const payload: IProgramPayload = await kv_liftosaur_programs.get(program.id, "json");
          payload.program = program;
          payload.version = version;
          await kv_liftosaur_programs.put(program.id, JSON.stringify(payload));
        })
      );
    }
  }

  export async function save(program: IProgram): Promise<void> {
    const oldProgram: IProgramPayload | undefined = await kv_liftosaur_programs.get(program.id, "json");
    const payload = { program, id: oldProgram?.id || "", timestamp: Date.now() };
    await kv_liftosaur_programs.put(program.id, JSON.stringify(payload));
  }

  export async function syncToProd(ids: string[]): Promise<string[]> {
    const syncedIds: string[] = [];
    await Promise.all(
      ids.map(async (id) => {
        const program: IProgramPayload | undefined = await kv_liftosaur_programs.get(id, "json");
        if (program != null) {
          syncedIds.push(id);
          await kv_liftosaur_programs_prod.put(id, JSON.stringify(program));
        }
      })
    );
    return syncedIds;
  }

  export async function syncToDev(ids: string[]): Promise<string[]> {
    const syncedIds: string[] = [];
    await Promise.all(
      ids.map(async (id) => {
        const program: IProgramPayload | undefined = await kv_liftosaur_programs_prod.get(id, "json");
        if (program != null) {
          syncedIds.push(id);
          await kv_liftosaur_programs.put(id, JSON.stringify(program));
        }
      })
    );
    return syncedIds;
  }
}