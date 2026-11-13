import { Pipe, PipeTransform } from '@angular/core';
import { getModelLabelByKey } from './get-model-label-by-key';

@Pipe({
  name: 'modelLabel',
  standalone: true,
  pure: true,
})
export class ModelLabelPipe implements PipeTransform {
  transform(key: string | null | undefined): string {
    if (!key) return '';
    return getModelLabelByKey(key);
  }
}
