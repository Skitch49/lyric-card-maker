import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import html2canvas from 'html2canvas';
import { take } from 'rxjs';

@Component({
  selector: 'app-card',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent implements OnInit {
  public image: any = 'url(generiqueBackground.webp)'; 
  lyricsText1: string = "Clique pour éditer";
  lyricsText2: string = "Appuie sur entrer pour ajouter une ligne";
  artistText: string = 'ARTIST, "SONG NAME"';
  private fb = inject(FormBuilder);
  color :any = '#000';

  @ViewChildren('lyricInput') lyricElement!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  lyricCardForm = this.fb.group({
    image: [this.image, [Validators.required]],
    lyrics: this.fb.array([
      this.fb.control(this.lyricsText1,
        [Validators.required, Validators.minLength(2)])
      ,
      this.fb.control(this.lyricsText2,
        [Validators.required, Validators.minLength(2)])
      ,
    ]),
    artiste: [this.artistText, [Validators.required, Validators.minLength(4)]],
  });

  get lyrics(): FormArray {
    return this.lyricCardForm.get('lyrics') as FormArray;
  }

  ngOnInit(): void {
    this.lyricCardForm.valueChanges.subscribe(() => {
      this.replaceSpacesInLyrics();

    });
  
  }

  renderImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.image = `url(${e.target?.result})`;
      };
      reader.readAsDataURL(file);
    }
  }

  addLyricControl(index: number) {
    if (this.lyrics.length < 4) {
      const newLyricGroup = this.fb.control('', [
        Validators.required,
        Validators.minLength(1),
      ]);

      if (index + 1 == this.lyrics.controls.length) {
        this.lyrics.push(newLyricGroup);

        this.lyricElement.changes.pipe(take(1)).subscribe({
          next: (changes) => {
            const newIndex = index + 1; // Focus sur l'élément suivant
            const inputElement = changes.toArray()[newIndex]?.nativeElement;
            if (inputElement) {
              inputElement.focus();
            }
          },
        });
      } else {
        setTimeout(() => {
          const inputElement = this.lyricElement.get(index + 1)?.nativeElement;
          if (inputElement) {
            inputElement.focus(); // Focus directement sur le dernier élément
          }
        }, 0);
      }
    } else {
      setTimeout(() => {
        const inputElement = this.lyricElement.get(index + 1)?.nativeElement;
        if (inputElement) {
          inputElement.focus(); // Focus directement sur le dernier élément
        }
      }, 0);
    }
  }
  removeLyricControl(e: KeyboardEvent, index: number) {
    if (
      this.lyrics.length > 0 &&
      (e.target as HTMLInputElement).value === '' &&
      (e.key === 'Delete' ||
        (e.key === 'Backspace' && this.lyrics.controls.length > 1))
    ) {
      console.log('index: ' + index);

      this.lyrics.removeAt(index);

      // Focus sur le contrôle précédent après la suppression (index - 1)
      this.lyricElement.changes.pipe(take(1)).subscribe({
        next: (changes) => {
          const newIndex = index - 1;
          const inputElement = changes.toArray()[newIndex]?.nativeElement;
          if (inputElement) {
            inputElement.focus();
          }
        },
      });
    }
  }

  getFormControl(index: number): FormControl {
    return this.lyrics.controls[index] as FormControl;
  }

  replaceSpacesInLyrics() {
    this.lyrics.controls.forEach((control) => {
      const currentValue = control.value || '';
      const updatedValue = currentValue.replace(/ /g, '\u00A0');
      control.setValue(updatedValue, { emitEvent: false });
    });
  }

  updateFile() {
    const fileInput = document.querySelector(
      '.update-input-file'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  download() {
    const lyricsCardPicture = document.querySelector(
      '.container-card'
    ) as HTMLDivElement;
    if (lyricsCardPicture) {
      html2canvas(lyricsCardPicture,{scale: 3}).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'lyrics-card-genius';
        link.click();
      });
    }
  }
}
