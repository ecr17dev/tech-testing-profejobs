import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GradeFormComponent } from './grade-form.component';

describe('GradeFormComponent', () => {
  let component: GradeFormComponent;
  let fixture: ComponentFixture<GradeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GradeFormComponent);
    component = fixture.componentInstance;
    component.studentName = 'Ana Pérez';
    component.evaluationName = 'Prueba 1';
    fixture.detectChanges();
  });

  it('marks form invalid for out of range score', () => {
    component.form.controls.score.setValue(0.9);
    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);
  });

  it('marks form invalid for score above max range', () => {
    component.form.controls.score.setValue(7.1);
    fixture.detectChanges();

    expect(component.form.invalid).toBe(true);
  });

  it('emits save with valid score', () => {
    const saveSpy = vi.spyOn(component.save, 'emit');

    component.form.controls.score.setValue(6.5);
    component.submit();

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({ score: 6.5 }),
    );
  });

  it('requires evaluation name when creating new evaluation + grade', () => {
    component.requireEvaluationMetadata = true;
    component.evaluationName = '';
    component.ngOnChanges({
      requireEvaluationMetadata: {
        currentValue: true,
        previousValue: false,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    component.form.controls.evaluationName.setValue('');
    component.submit();

    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.evaluationName.hasError('required')).toBe(
      true,
    );
  });
});
