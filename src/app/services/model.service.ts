import { Injectable, signal } from '@angular/core';

import { FindModel, FindModels, Model } from '../shared/entities/model.entity';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  public value = signal<Model | null>(null);
  public loading = signal(false);

  constructor(
    private _findModel: FindModel,
    private _findModels: FindModels
  ) {}

  async fetchModel(tag: string, version: string): Promise<void> {
    this.loading.set(true);
    const result = await lastValueFrom(
      this._findModels.fetch({ where: { tag: { eq: tag }, version: { eq: version } } })
    );
    if (result.errors) throw result.errors;
    if (result.data?.models?.set?.[0]) this.value.set(result.data.models.set[0]);
    this.loading.set(false);
  }

  async fetchModelById(id: string): Promise<void> {
    this.loading.set(true);
    const result = await lastValueFrom(this._findModel.fetch({ id: id }));
    if (result.errors) throw result.errors;
    if (result.data?.model) this.value.set(result.data?.model);
    this.loading.set(false);
  }

  async refetchModel(): Promise<void> {
    if (this.value()?.id) this.fetchModelById(this.value()!.id!);
  }

  reset(): void {
    this.value.set(null);
    this.loading.set(false);
  }
}
