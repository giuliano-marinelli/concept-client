import { Injectable, signal } from '@angular/core';

import { FindMetaModel, FindMetaModels, MetaModel } from '../shared/entities/meta-model.entity';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  public value = signal<MetaModel | null>(null);
  public loading = signal(false);

  constructor(
    private _findMetaModel: FindMetaModel,
    private _findMetaModels: FindMetaModels
  ) {}

  async fetchLanguage(tag: string, version: string): Promise<void> {
    this.loading.set(true);
    const result = await lastValueFrom(
      this._findMetaModels.fetch({ where: { tag: { eq: tag }, version: { eq: version } } })
    );
    if (result.errors) throw result.errors;
    if (result.data?.metaModels?.set?.[0]) this.value.set(result.data.metaModels.set[0]);
    this.loading.set(false);
  }

  async fetchLanguageById(id: string): Promise<void> {
    this.loading.set(true);
    const result = await lastValueFrom(this._findMetaModel.fetch({ id: id }));
    if (result.errors) throw result.errors;
    if (result.data?.metaModel) this.value.set(result.data?.metaModel);
    this.loading.set(false);
  }

  async refetchLanguage(): Promise<void> {
    if (this.value()?.id) this.fetchLanguageById(this.value()!.id!);
  }

  reset(): void {
    this.value.set(null);
    this.loading.set(false);
  }
}
