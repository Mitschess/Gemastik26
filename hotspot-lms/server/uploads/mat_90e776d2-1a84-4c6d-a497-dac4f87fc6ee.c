#include <stdio.h>
#include <stdlib.h>

int *pos;
int temp;

void ukur(int nd, int tinggi[4]) {
    for(int i = 1; i <= 3; i++) {
        tinggi[i] = 0;
    }
    for(int i = 1; i <= nd; i++) {
        tinggi[pos[i]]++;
    }
}

void gambar(int size, int maks) {
    int pading = maks - size;

    for(int i = 0; i < pading; i++) {
        printf(" ");
    }
    for(int i = 0; i < size; i++) {
        printf("=");
    }
    printf("#");
    for(int i = 0; i < size; i++) {
        printf("=");
    }
    for(int i = 0; i < pading; i++) {
        printf(" ");
    }
}

void cetak(int nd) {
    int tinggi[4];
    ukur(nd, tinggi);
    
    int top = 0;
    for(int i = 1; i <= 3; i++) {
        if(tinggi[i] > top) {
            top = tinggi[i];
        }
    }

    int maksL = nd;

    printf("\n");
    for(int idx = top; idx >= 1; idx--) {
        for(int t = 1; t <= 3; t++) {
            int disc = 0;
            int count = 0;
            for(int i = 1; i <= nd; i++) {
                if(pos[i] == t) {
                    count++;

                    if(count == tinggi[t] - idx + 1) {
                        disc = i;
                        break;
                    }
                }
            }

            if (disc > 0){
                gambar(disc, maksL);
            }
            else {
                for (int i = 0; i < maksL; i++) {
                    printf(" ");
                }
                printf("|");
                for (int i = 0; i < maksL; i++) {
                    printf(" ");
                }
            }

            printf("\t");
        }
        printf("\n");
    }
}

void tower(char dari, char ke, char t, int n, int total) {
    if(n == 1) {
        printf("----------------------------\n");
        printf("Pindahkan disc 1 dari %c ke %c\n", dari, ke);
        
        if(dari == 'A') {
            if (ke == 'B') pos[1] = 2;
            else pos[1] = 3;
        } else if (dari == 'B') {
            if (ke == 'A') pos[1] = 1;
            else pos[1] = 3;
        } else {
            if (ke == 'A') pos[1] = 1;
            else pos[1] = 2;
        }

        cetak(total);
    } else {
        tower(dari, t, ke, n - 1, total);

        printf("----------------------------\n");
        printf("Pindahkan disc %d dari %c ke %c\n", n, dari, ke);
        if(dari == 'A') {
            if (ke == 'B') pos[n] = 2;
            else pos[n] = 3;
        } else if (dari == 'B') {
            if (ke == 'A') pos[n] = 1;
            else pos[n] = 3;
        } else {
            if (ke == 'A') pos[n] = 1;
            else pos[n] = 2;
        }

        cetak(total);
        tower(t, ke, dari, n - 1, total);
    }
}

int main() {
    int n;
    printf("Berapa keping: ");
    scanf("%d", &n);

    pos = malloc((n + 1) * sizeof(int));
    if (!pos) return 1;

    for (int i = 1; i <= n; i++) pos[i] = 1;

    temp = n;
    cetak(n);
    tower('A', 'C', 'B', n, temp);

    free(pos);
    return 0;
}
